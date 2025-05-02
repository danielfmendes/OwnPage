package utils

import (
	"net/http"
)

func HandleDelete(w http.ResponseWriter, query string, id int) {
	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}

	// Führe die DELETE-Abfrage aus
	_, err = conn.Exec(query, id)
	if err != nil {
		HandleError(w, err, "Fehler beim Löschen des Datensatzes")
		return
	}

	// Bestätigungsnachricht zurückgeben
	w.WriteHeader(http.StatusNoContent)
}
