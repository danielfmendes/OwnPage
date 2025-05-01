package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetWareHouseParts(w http.ResponseWriter, _ *http.Request) {
	utils.HandleGet(w, "SELECT * FROM warehouse_parts", func(scanner utils.Scanner) (any, error) {
		var b models.WarehousePart
		err := scanner.Scan(&b.ID, &b.PartType, &b.PartID, &b.Quantity, &b.StorageLocation)
		return b, err
	})
}
