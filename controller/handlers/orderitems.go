package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

func OrderItemsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		filter := r.URL.Query().Get("filter")
		if strings.HasPrefix(filter, "order_id:$eq.") {
			GetOrderItemsByOrderID(w, r)
		} else {
			GetOrderItems(w, r)
		}
	case http.MethodDelete:
		DeleteOrderItems(w, r)
	case http.MethodPut:
		UpdateOrderItems(w, r)
	case http.MethodPost:
		InsertOrderItems(w, r)
	default:
		http.Error(w, utils.ErrMsgMethodNotAllowed, http.StatusMethodNotAllowed)
	}
}

func GetOrderItems(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM order_items", func(scanner utils.Scanner) (any, error) {
		var b models.OrderItem
		err := scanner.Scan(&b.ID, &b.OrderID, &b.BikeID, &b.Number, &b.Price)
		return b, err
	})
}

func GetOrderItemsByOrderID(w http.ResponseWriter, r *http.Request) {
	filter := r.URL.Query().Get("filter")
	if filter == "" {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Beispiel: filter = "order_id:$eq.3"
	prefix := "order_id:$eq."
	if !strings.HasPrefix(filter, prefix) {
		http.Error(w, "Invalid filter format", http.StatusBadRequest)
		return
	}

	orderidStr := strings.TrimPrefix(filter, prefix)
	orderid, err := strconv.Atoi(orderidStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	query := utils.MustReadSQLFile("selects/orderitemselect.sql")

	utils.HandleGet(w, r, query, func(scanner utils.Scanner) (any, error) {
		var b models.OrderItemsWithBikeName
		err := scanner.Scan(&b.ID, &b.OrderID, &b.BikeID, &b.ModelName, &b.Number, &b.Price)
		return b, err
	}, orderid)
}

func DeleteOrderItems(w http.ResponseWriter, r *http.Request) {
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
	projectIdQuery := "SELECT project_id FROM order_items oi JOIN public.orders o ON o.id = oi.order_id WHERE oi.id = $1"
	utils.HandleDelete(w, r, "DELETE FROM order_items WHERE id = $1", []string{}, projectIdQuery, []interface{}{id}, id)
}

func UpdateOrderItems(w http.ResponseWriter, r *http.Request) {
	// Extrahiere die neuen Werte aus dem Request Body, inklusive der ID
	var orderItem models.OrderItem
	err := json.NewDecoder(r.Body).Decode(&orderItem)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	if orderItem.ID == 0 {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	projectIdQuery := "SELECT project_id FROM orders o WHERE o.id = $1"
	query := `UPDATE order_items SET order_id = $1, bike_id = $2, number = $3, price = $4 WHERE id = $5`
	args := []any{orderItem.OrderID, orderItem.BikeID, orderItem.Number, orderItem.Price, orderItem.ID}
	err = utils.HandleUpdate(w, r, query, projectIdQuery, []interface{}{orderItem.OrderID}, args...)
}

func InsertOrderItems(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	// Extrahiere die neuen Werte aus dem Request Body
	var orderItem models.OrderItem
	err := json.NewDecoder(r.Body).Decode(&orderItem)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	projectIdQuery := "SELECT project_id FROM orders o WHERE o.id = $1"
	query := `INSERT INTO order_items (order_id, bike_id, number, price) VALUES ($1, $2, $3, $4)`
	args := []any{orderItem.OrderID, orderItem.BikeID, orderItem.Number, orderItem.Price}
	err = utils.HandleInsert(w, r, query, projectIdQuery, []interface{}{orderItem.OrderID}, args...)
}
