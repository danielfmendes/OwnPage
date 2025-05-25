package handlers

import (
	"controller/models"
	"controller/utils"
	"net/http"
)

func ComponentHandler(w http.ResponseWriter, r *http.Request) {
	componentType, ok := utils.ExtractFilterValue(r, "type")
	if !ok {
		http.Error(w, "Missing or invalid 'type' filter", http.StatusBadRequest)
		return
	}

	switch componentType {
	case "frames":
		GetFrames(w, r)
	case "forks":
		GetForks(w, r)
	case "saddles":
		GetSaddles(w, r)
	default:
		http.Error(w, "Unknown component type", http.StatusBadRequest)
	}
}

func GetFrames(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM frames", func(scanner utils.Scanner) (any, error) {
		var b models.Frame
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}

func GetForks(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM forks", func(scanner utils.Scanner) (any, error) {
		var b models.Fork
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}

func GetSaddles(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM saddles", func(scanner utils.Scanner) (any, error) {
		var b models.Saddle
		err := scanner.Scan(&b.ID, &b.Name)
		return b, err
	})
}
