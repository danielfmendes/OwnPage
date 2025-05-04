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
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func GetBikes(w http.ResponseWriter, r *http.Request) {
	utils.HandleGetWithProjectIDs(w, r, `
		SELECT b.id,
			   b.model_id,
			   b.serial_number,
			   b.production_date,
			   b.quantity,
			   b.warehouse_location,
			   b.project_id,
			   bm.name
		FROM bikes b
			 	join public.bike_models bm on b.model_id = bm.id
	`, func(scanner utils.Scanner) (any, error) {
		var p models.BikeWithModelName
		err := scanner.Scan(&p.ID, &p.ModelID, &p.SerialNumber, &p.ProductionDate, &p.Quantity, &p.WarehouseLocation, &p.ProjectID, &p.ModelName)
		return p, err
	})
}

func DeleteBike(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Ungültige ID", http.StatusBadRequest)
		return
	}
	utils.HandleDelete(w, r, "DELETE FROM bikes WHERE id = $1", []string{}, id)
}

func DeleteCascadeBike(w http.ResponseWriter, r *http.Request) {
	// ID aus der URL oder Anfrage extrahieren
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Convert string ID to integer
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Ungültige ID", http.StatusBadRequest)
		return
	}

	// Zuerst die `order_items` für das betroffene `bike` löschen
	utils.HandleDelete(w, r,
		"DELETE FROM bikes WHERE id = $1",
		[]string{
			"DELETE FROM order_items WHERE bike_id = $1",
			"DELETE FROM orders WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items)",
		},
		id,
	)
}

func UpdateBike(w http.ResponseWriter, r *http.Request) {
	// Extrahiere die neuen Werte aus dem Request Body, inklusive der ID
	var part models.Bike
	err := json.NewDecoder(r.Body).Decode(&part)
	if err != nil {
		http.Error(w, "Fehler beim Verarbeiten der Anfrage", http.StatusBadRequest)
		return
	}

	if part.ID == 0 {
		http.Error(w, "ID fehlt", http.StatusBadRequest)
		return
	}

	// Verwende die HandleUpdate-Funktion, um das Update in der DB auszuführen
	query := `UPDATE bikes SET model_id = $1, serial_number = $2, production_date = $3, quantity = $4, warehouse_location = $5, project_id = $6 WHERE id = $7`
	err = utils.HandleUpdate(w, r, query, part.ModelID, part.SerialNumber, part.ProductionDate, part.Quantity, part.WarehouseLocation, part.ProjectID, part.ID)
}

func InsertBike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Nur POST erlaubt", http.StatusMethodNotAllowed)
		return
	}

	// Extrahiere die neuen Werte aus dem Request Body
	var part models.Bike
	err := json.NewDecoder(r.Body).Decode(&part)
	if err != nil {
		http.Error(w, "Fehler beim Verarbeiten der Anfrage", http.StatusBadRequest)
		return
	}

	// Verwende die HandleInsert-Funktion, um das Insert in der DB auszuführen
	query := `INSERT INTO bikes (model_id ,serial_number ,production_date, quantity ,warehouse_location ,project_id) VALUES ($1, $2, $3, $4, $5, $6)`
	err = utils.HandleInsert(w, r, query, part.ModelID, part.SerialNumber, part.ProductionDate, part.Quantity, part.WarehouseLocation, part.ProjectID)
}
