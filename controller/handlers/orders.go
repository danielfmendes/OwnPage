package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

func OrderHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if r.URL.Query().Get("email") != "" {
			GetOrdersByEmail(w, r)
		} else {
			GetOrders(w, r)
		}
	case http.MethodDelete:
		if r.URL.Query().Get("cascade") == "true" {
			DeleteCascadeOrder(w, r)
		} else {
			DeleteOrder(w, r)
		}
	case http.MethodPut:
		UpdateOrder(w, r)
	case http.MethodPost:
		InsertOrder(w, r)
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func GetOrders(w http.ResponseWriter, r *http.Request) {
	query := utils.MustReadSQLFile("selects/orderselect.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var order models.OrderWithCustomer
		err := scanner.Scan(&order.ID, &order.OrderDate, &order.ProjectID, &order.CustomerID, &order.CustomerName, &order.CustomerEmail)
		return order, err
	})
}

func GetOrdersByEmail(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email fehlt", http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/orderbycustomerselect.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var order models.OrderItemsWithBikeAndDate
		err := scanner.Scan(&order.ID, &order.OrderID, &order.BikeID, &order.Number, &order.Price, &order.ModelName, &order.OrderDate)
		return order, err
	}, email)
}

func DeleteOrder(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Ungültige ID", http.StatusBadRequest)
		return
	}
	projectIdQuery := "SELECT project_id FROM customers WHERE id = $1"
	utils.HandleDelete(w, r, "DELETE FROM orders WHERE id = $1", []string{}, projectIdQuery, []interface{}{id}, id)
}

func DeleteCascadeOrder(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Ungültige ID", http.StatusBadRequest)
		return
	}

	// Zuerst die `order_items` für das betroffene `bike` löschen
	projectIdQuery := "SELECT project_id FROM customers WHERE id = $1"
	utils.HandleDelete(w, r,
		"DELETE FROM orders WHERE id = $1",
		[]string{
			"DELETE FROM order_items WHERE order_id = $1",
		},
		projectIdQuery,
		[]interface{}{id},
		id,
	)
}

func UpdateOrder(w http.ResponseWriter, r *http.Request) {
	// Extrahiere die neuen Werte aus dem Request Body, inklusive der ID
	var order models.Order
	err := json.NewDecoder(r.Body).Decode(&order)
	if err != nil {
		http.Error(w, "Fehler beim Verarbeiten der Anfrage", http.StatusBadRequest)
		return
	}

	if order.ID == 0 {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Verwende die HandleUpdate-Funktion, um das Update in der DB auszuführen
	query := `UPDATE orders SET order_date = $1, customer_id = $2, project_id = $3 WHERE id = $4`
	args := []any{order.OrderDate, order.CustomerID, order.ProjectID, order.ID}
	err = utils.HandleUpdate(w, r, query, order.ProjectID, nil, args...)
}

func InsertOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Nur POST erlaubt", http.StatusMethodNotAllowed)
		return
	}

	// Extrahiere die neuen Werte aus dem Request Body
	var order models.Order
	err := json.NewDecoder(r.Body).Decode(&order)
	if err != nil {
		http.Error(w, "Fehler beim Verarbeiten der Anfrage", http.StatusBadRequest)
		return
	}

	// Verwende die HandleInsert-Funktion, um das Insert in der DB auszuführen
	query := `INSERT INTO orders (customer_id, order_date,project_id) VALUES ($1, $2, $3)`
	args := []any{order.CustomerID, order.OrderDate, order.ProjectID}
	err = utils.HandleInsert(w, r, query, order.ProjectID, nil, args...)
}
