package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetBikeModels(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM bike_models", func(scanner utils.Scanner) (any, error) {
		var b models.BikeModel
		err := scanner.Scan(&b.ID, &b.Name, &b.SaddleID, &b.FrameID, &b.ForkID)
		return b, err
	})
}
