package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func GetUsers(w http.ResponseWriter, _ *http.Request) {
	utils.HandleGet(w, "SELECT * FROM users", func(scanner utils.Scanner) (any, error) {
		var b models.User
		err := scanner.Scan(&b.ID, &b.Username, &b.PasswordHash, &b.CreatedAt)
		return b, err
	})
}
