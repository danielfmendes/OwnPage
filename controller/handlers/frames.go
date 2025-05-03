package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetFrames(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM frames", func(scanner utils.Scanner) (any, error) {
		var b models.Frame
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}
