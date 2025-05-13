package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func OrderHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if r.URL.Query().Get("email") != "" {
			GetOrdersByEmail(w, r)
		} else {
			GetOrders(w, r)
		}
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func GetOrders(w http.ResponseWriter, r *http.Request) {
	query := utils.MustReadSQLFile("selects/orderselect.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var order models.OrderOverview
		err := scanner.Scan(&order.OrderID, &order.OrderItemID, &order.ProjectID, &order.CustomerName, &order.OrderDate, &order.BikeModel, &order.Number, &order.Price)
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
		var order models.OrderOverview
		err := scanner.Scan(&order.OrderID, &order.OrderItemID, &order.ProjectID, &order.CustomerName, &order.OrderDate, &order.BikeModel, &order.Number, &order.Price)
		return order, err
	}, email)
}
