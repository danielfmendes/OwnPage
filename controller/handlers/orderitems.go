package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetOrderItems(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM order_items", func(scanner utils.Scanner) (any, error) {
		var b models.OrderItem
		err := scanner.Scan(&b.ID, &b.OrderID, &b.BikeID, &b.Price)
		return b, err
	})
}
