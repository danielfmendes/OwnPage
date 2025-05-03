package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetOrders(w http.ResponseWriter, r *http.Request) {
	utils.HandleGetWithProjectIDs(w, r, "SELECT * FROM orders", func(scanner utils.Scanner) (any, error) {
		var b models.Order
		err := scanner.Scan(&b.ID, &b.CustomerID, &b.OrderDate, &b.TotalPrice, &b.ProjectID)
		return b, err
	})
}
