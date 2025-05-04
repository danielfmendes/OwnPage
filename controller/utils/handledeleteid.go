package utils

import (
	"database/sql"
	"fmt"
	"github.com/lib/pq"
	"net/http"
	"strings"
)

func HandleDelete(w http.ResponseWriter, r *http.Request, mainQuery string, preQueries []string, args ...interface{}) {
	// Tabelle aus der Query extrahieren
	table, err := extractTableFromDeleteQuery(mainQuery)
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
	err = conn.QueryRow(queryProject, args[0]).Scan(&projectID)
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

	// Pre-Queries ausführen
	for _, pq := range preQueries {
		if strings.Contains(pq, "$") {
			_, err := conn.Exec(pq, args...)
			if err != nil {
				HandleError(w, err, "Fehler bei vorbereitender Löschabfrage")
				return
			}
		} else {
			_, err := conn.Exec(pq)
			if err != nil {
				HandleError(w, err, "Fehler bei vorbereitender Löschabfrage")
				return
			}
		}
	}

	// Haupt-Löschvorgang
	_, err = conn.Exec(mainQuery, args...)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23503" { // Referenzielle Integritätsverletzung (Foreign Key Constraint)
				http.Error(w, "Fehler beim Löschen des Datensatzes: Der Datensatz wird von anderen Datensätzen referenziert.", http.StatusConflict)
				return
			}
		}
		HandleError(w, err, "Fehler beim Löschen des Datensatzes")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
