package utils

import (
	"encoding/json"
	"net/http"
)

type Scanner interface {
	Scan(dest ...any) error
}

func HandleGet(w http.ResponseWriter, query string, scanFunc func(Scanner) (any, error)) {
	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}

	rows, err := conn.Query(query)
	if err != nil {
		HandleError(w, err, "Fehler bei der Datenbankabfrage")
		return
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		item, err := scanFunc(rows)
		if err != nil {
			HandleError(w, err, "Fehler beim Scannen der Daten")
			return
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		HandleError(w, err, "Fehler beim Lesen der Zeilen")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
