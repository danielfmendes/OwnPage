package utils

import (
	"database/sql"
	"fmt"
	"net/http"
)

func HandleUpdate(w http.ResponseWriter, r *http.Request, query string, args ...interface{}) error {
	userEmail, err := ValidateToken(w, r)
	if err != nil {
		return err
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return err
	}
	defer conn.Close()

	// Tabelle aus der UPDATE-Query extrahieren
	table, err := extractTableFromUpdateQuery(query)
	if err != nil {
		http.Error(w, "Ungültige UPDATE-Query", http.StatusBadRequest)
		return err
	}

	// Letztes Argument = ID
	if len(args) == 0 {
		http.Error(w, "ID-Parameter fehlt", http.StatusBadRequest)
		return fmt.Errorf("kein ID-Parameter übergeben")
	}
	id := args[len(args)-1]

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
		return err
	}

	// Admin-Rechte prüfen
	hasAccess, err := GetProjectIDForUser(conn, userEmail, projectID, "admin")
	if err != nil {
		HandleError(w, err, "Fehler bei der Rechteprüfung")
		return err
	}
	if !hasAccess {
		http.Error(w, "Keine Adminrechte für dieses Projekt", http.StatusForbidden)
		return fmt.Errorf("nicht berechtigt")
	}

	// Update durchführen
	_, err = conn.Exec(query, args...)
	if err != nil {
		HandleError(w, err, "Fehler beim Aktualisieren des Datensatzes")
		return err
	}

	w.WriteHeader(http.StatusNoContent)
	return nil
}
