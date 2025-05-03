package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetSaddles(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM saddles", func(scanner utils.Scanner) (any, error) {
		var b models.Saddle
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}
