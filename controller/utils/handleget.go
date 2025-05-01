package utils

import (
	"controller/db"
	"encoding/json"
	"log"
	"net/http"
)

type Scanner interface {
	Scan(dest ...any) error
}

func HandleGet(w http.ResponseWriter, query string, scanFunc func(Scanner) (any, error)) {
	conn, err := db.Connect()
	if err != nil {
		http.Error(w, "Datenbankverbindung fehlgeschlagen", http.StatusInternalServerError)
		log.Println("DB Connect Fehler:", err)
		return
	}
	defer conn.Close()

	rows, err := conn.Query(query)
	if err != nil {
		http.Error(w, "Fehler bei der Datenbankabfrage", http.StatusInternalServerError)
		log.Println("Query Fehler:", err)
		return
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		item, err := scanFunc(rows)
		if err != nil {
			http.Error(w, "Fehler beim Scannen der Daten", http.StatusInternalServerError)
			log.Println("Scan Fehler:", err)
			return
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Fehler beim Lesen der Zeilen", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
