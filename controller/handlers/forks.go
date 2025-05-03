package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetForks(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM forks", func(scanner utils.Scanner) (any, error) {
		var b models.Fork
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}
