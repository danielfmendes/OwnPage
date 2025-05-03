package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetCustomers(w http.ResponseWriter, r *http.Request) {
	utils.HandleGetWithProjectIDs(w, r, "SELECT * FROM customers", func(scanner utils.Scanner) (any, error) {
		var b models.Customer
		err := scanner.Scan(&b.ID, &b.Email, &b.Password, &b.FirstName, &b.Name, &b.Dob, &b.Location, &b.ProjectID)
		return b, err
	})
}
