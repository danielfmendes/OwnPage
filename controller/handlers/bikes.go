package handlers

import (
	"controller/db"
	"encoding/json"
	"log"
	"net/http"
)

// Bike repräsentiert die Datenstruktur eines Fahrrads
type Bike struct {
	ID                int    `json:"id"`
	ModelID           int    `json:"model_id"`
	SerialNumber      string `json:"serial_number"`
	ProductionDate    string `json:"production_date"` // als String für JSON
	WarehouseLocation string `json:"warehouse_location"`
}

func GetBikes(w http.ResponseWriter, r *http.Request) {
	// Verbindung zur Datenbank herstellen
	db, err := db.Connect()
	if err != nil {
		http.Error(w, "Datenbankverbindung fehlgeschlagen", http.StatusInternalServerError)
		log.Println("Fehler beim Öffnen der Datenbank:", err)
		return
	}
	defer db.Close()

	// Abfrage der Bikes aus der Datenbank
	rows, err := db.Query("SELECT id, model_id, serial_number, production_date, warehouse_location FROM bikes")
	if err != nil {
		http.Error(w, "Fehler beim Abrufen der Fahrräder", http.StatusInternalServerError)
		log.Println("Fehler bei der Abfrage der Fahrräder:", err)
		return
	}
	defer rows.Close()

	// Fahrräder in ein Slice packen
	var bikes []Bike
	for rows.Next() {
		var bike Bike
		if err := rows.Scan(&bike.ID, &bike.ModelID, &bike.SerialNumber, &bike.ProductionDate, &bike.WarehouseLocation); err != nil {
			http.Error(w, "Fehler beim Scannen der Daten", http.StatusInternalServerError)
			return
		}
		bikes = append(bikes, bike)
	}

	// Fehlerbehandlung für den Fall, dass keine Zeilen abgerufen wurden
	if err := rows.Err(); err != nil {
		http.Error(w, "Fehler bei der Datenbankabfrage", http.StatusInternalServerError)
		return
	}

	// Antwort als JSON zurückgeben
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(bikes); err != nil {
		http.Error(w, "Fehler beim Codieren der Antwort", http.StatusInternalServerError)
	}
}
