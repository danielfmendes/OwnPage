package utils

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleDelete(w http.ResponseWriter, r *http.Request, query string, id int) {
	// Tabelle aus der Query extrahieren (z.B. "DELETE FROM warehouse_parts WHERE id = $1")
	table, err := extractTableFromDeleteQuery(query)
	if err != nil {
		http.Error(w, "Ungültige DELETE-Query", http.StatusBadRequest)
		return
	}

	userEmail, err := ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	// Projekt-ID ermitteln
	var projectID int
	queryProject := fmt.Sprintf("SELECT project_id FROM %s WHERE id = $1", table)
	err = conn.QueryRow(queryProject, id).Scan(&projectID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Eintrag nicht gefunden", http.StatusNotFound)
		} else {
			HandleError(w, err, "Fehler beim Abrufen der Projekt-ID")
		}
		return
	}

	// Admin-Rechte prüfen
	hasAccess, err := GetProjectIDForUser(conn, userEmail, projectID, "admin")
	if err != nil {
		HandleError(w, err, "Fehler bei der Rechteprüfung")
		return
	}
	if !hasAccess {
		http.Error(w, "Keine Adminrechte für dieses Projekt", http.StatusForbidden)
		return
	}

	// Löschvorgang
	_, err = conn.Exec(query, id)
	if err != nil {
		HandleError(w, err, "Fehler beim Löschen des Datensatzes")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
