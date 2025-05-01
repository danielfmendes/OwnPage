package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetPartCosts(w http.ResponseWriter, _ *http.Request) {
	utils.HandleGet(w, "SELECT * FROM part_costs", func(scanner utils.Scanner) (any, error) {
		var b models.PartCost
		err := scanner.Scan(&b.PartType, &b.PartID, &b.Cost)
		return b, err
	})
}
