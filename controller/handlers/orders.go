package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetOrders(w http.ResponseWriter, r *http.Request) {
	query := utils.MustReadSQLFile("selects/orderselect.sql")

	utils.HandleGetWithProjectIDs(w, r, query, func(scanner utils.Scanner) (any, error) {
		var order models.OrderOverview
		err := scanner.Scan(&order.OrderID, &order.OrderItemID, &order.ProjectID, &order.CustomerName, &order.OrderDate, &order.BikeModel, &order.Number, &order.Price)
		return order, err
	})
}
