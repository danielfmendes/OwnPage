package utils

import (
	"net/http"
)

func HandleInsert(w http.ResponseWriter, query string, args ...interface{}) error {
	conn, err := ConnectToDB(w)
	if err != nil {
		return err
	}

	// Führe die Insert-Abfrage aus
	_, err = conn.Exec(query, args...)
	if err != nil {
		HandleError(w, err, "Fehler beim Aktualisieren des Datensatzes")
		return err
	}

	// Bestätigung zurückgeben
	w.WriteHeader(http.StatusCreated)
	return nil
}
