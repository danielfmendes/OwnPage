package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetCustomers(w http.ResponseWriter, _ *http.Request) {
	utils.HandleGet(w, "SELECT * FROM customers", func(scanner utils.Scanner) (any, error) {
		var b models.Customer
		err := scanner.Scan(&b.ID, &b.Name, &b.Email, &b.Location)
		return b, err
	})
}
