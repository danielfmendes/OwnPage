package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

func CustomerHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetCustomers(w, r)
	case http.MethodDelete:
		if r.URL.Query().Get("cascade") == "true" {
			DeleteCascadeCustomer(w, r)
		} else {
			DeleteCustomer(w, r)
		}
	case http.MethodPut:
		UpdateCustomer(w, r)
	case http.MethodPost:
		InsertCustomer(w, r)
	default:
		http.Error(w, utils.ErrMsgMethodNotAllowed, http.StatusMethodNotAllowed)
	}
}

func GetCustomers(w http.ResponseWriter, r *http.Request) {
	utils.HandleGetWithProjectIDsWithPagination(w, r, "SELECT * FROM customers", func(scanner utils.Scanner) (any, error) {
		var b models.Customer
		err := scanner.Scan(&b.ID, &b.Email, &b.Password, &b.FirstName, &b.Name, &b.Dob, &b.City, &b.ProjectID)
		return b, err
	})
}

func DeleteCustomer(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	projectIdQuery := "SELECT project_id FROM customers WHERE id = $1"
	utils.HandleDelete(w, r, "DELETE FROM customers WHERE id = $1", []string{}, projectIdQuery, []interface{}{id}, id)
}

func DeleteCascadeCustomer(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	// Zuerst die `order_items` für das betroffene `bike` löschen
	projectIdQuery := "SELECT project_id FROM customers WHERE id = $1"
	utils.HandleDelete(w, r,
		"DELETE FROM customers WHERE id = $1",
		[]string{
			"DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = $1)",
			"DELETE FROM orders WHERE customer_id = $1",
		},
		projectIdQuery,
		[]interface{}{id},
		id,
	)
}

func UpdateCustomer(w http.ResponseWriter, r *http.Request) {
	// Extrahiere die neuen Werte aus dem Request Body, inklusive der ID
	var cust models.Customer
	err := json.NewDecoder(r.Body).Decode(&cust)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	if cust.ID == 0 {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Verwende die HandleUpdate-Funktion, um das Update in der DB auszuführen
	query := `UPDATE customers SET email = $1, password = $2, first_name = $3, name = $4, dob = $5, city = $6, project_id = $7 WHERE id = $8`
	args := []any{cust.Email, cust.Password, cust.FirstName, cust.Name, cust.Dob, cust.City, cust.ProjectID, cust.ID}
	err = utils.HandleUpdate(w, r, query, cust.ProjectID, nil, args...)
}

func InsertCustomer(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	// Extrahiere die neuen Werte aus dem Request Body
	var cust models.Customer
	err := json.NewDecoder(r.Body).Decode(&cust)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	// Verwende die HandleInsert-Funktion, um das Insert in der DB auszuführen
	query := `INSERT INTO customers (project_id, email, password, first_name, name, dob, city) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	args := []any{cust.ProjectID, cust.Email, cust.Password, cust.FirstName, cust.Name, cust.Dob, cust.City}
	err = utils.HandleInsert(w, r, query, cust.ProjectID, nil, args...)
}
