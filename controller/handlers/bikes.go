package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetBikes(w http.ResponseWriter, r *http.Request) {
	utils.HandleGetWithProjectIDs(w, r, "SELECT * FROM bikes", func(scanner utils.Scanner) (any, error) {
		var b models.Bike
		err := scanner.Scan(&b.ID, &b.ModelID, &b.SerialNumber, &b.ProductionDate, &b.WarehouseLocation, &b.ProjectID)
		return b, err
	})
}
