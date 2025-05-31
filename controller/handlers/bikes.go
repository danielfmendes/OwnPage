package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"net/http"
	"strconv"
)

func BikeHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetBikes(w, r)
	case http.MethodDelete:
		if r.URL.Query().Get("cascade") == "true" {
			DeleteCascadeBike(w, r)
		} else {
			DeleteBike(w, r)
		}
	case http.MethodPut:
		UpdateBike(w, r)
	case http.MethodPost:
		InsertBike(w, r)
	default:
		http.Error(w, utils.ErrMsgMethodNotAllowed, http.StatusMethodNotAllowed)
	}
}

func GetBikes(w http.ResponseWriter, r *http.Request) {
	query := utils.MustReadSQLFile("selects/bikesselect.sql")

	utils.HandleGetForDataTable(w, r, query, func(scanner utils.Scanner) (any, error) {
		var p models.BikeWithModelName
		err := scanner.Scan(&p.ID, &p.ModelID, &p.SerialNumber, &p.ProductionDate, &p.Quantity, &p.WarehouseLocation, &p.ProjectID, &p.ModelName)
		return p, err
	})
}

func DeleteBike(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	projectIdQuery := "SELECT project_id FROM bikes WHERE id = $1"
	utils.HandleDelete(w, r, "DELETE FROM bikes WHERE id = $1", []string{}, projectIdQuery, []interface{}{id}, id)
}

func DeleteCascadeBike(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	// Zuerst die `order_items` für das betroffene `bike` löschen
	projectIdQuery := "SELECT project_id FROM bikes WHERE id = $1"
	utils.HandleDelete(w, r,
		"DELETE FROM bikes WHERE id = $1",
		[]string{
			"DELETE FROM order_items WHERE bike_id = $1",
			"DELETE FROM orders WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items)",
		},
		projectIdQuery,
		[]interface{}{id},
		id,
	)
}

func UpdateBike(w http.ResponseWriter, r *http.Request) {
	// Extrahiere die neuen Werte aus dem Request Body, inklusive der ID
	var bike models.Bike
	err := json.NewDecoder(r.Body).Decode(&bike)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	if bike.ID == 0 {
		http.Error(w, utils.ErrMsgIdMissing, http.StatusBadRequest)
		return
	}

	// Verwende die HandleUpdate-Funktion, um das Update in der DB auszuführen
	query := `UPDATE bikes SET model_id = $1, serial_number = $2, production_date = $3, quantity = $4, warehouse_location = $5, project_id = $6 WHERE id = $7`
	args := []any{bike.ModelID, bike.SerialNumber, bike.ProductionDate, bike.Quantity, bike.WarehouseLocation, bike.ProjectID, bike.ID}
	err = utils.HandleUpdate(w, r, query, bike.ProjectID, nil, args...)
}

func InsertBike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	// Extrahiere die neuen Werte aus dem Request Body
	var bike models.Bike
	err := json.NewDecoder(r.Body).Decode(&bike)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	// Verwende die HandleInsert-Funktion, um das Insert in der DB auszuführen
	query := `INSERT INTO bikes (project_id, model_id, serial_number, production_date, quantity, warehouse_location) VALUES ($1, $2, $3, $4, $5, $6)`
	args := []interface{}{bike.ProjectID, bike.ModelID, bike.SerialNumber, bike.ProductionDate, bike.Quantity, bike.WarehouseLocation}
	err = utils.HandleInsert(w, r, query, bike.ProjectID, nil, args...)
}
