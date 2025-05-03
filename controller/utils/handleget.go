package utils

import (
	"encoding/json"
	"fmt"
	"github.com/lib/pq"
	"net/http"
	"strings"
)

type Scanner interface {
	Scan(dest ...any) error
}

func HandleGet(w http.ResponseWriter, r *http.Request, query string, scanFunc func(Scanner) (any, error), args ...interface{}) {
	_, err := ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}

	// Übergib die args (Parameter) an die Query
	rows, err := conn.Query(query, args...)
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

func HandleGetWithProjectIDs(w http.ResponseWriter, r *http.Request, baseQuery string, scanFunc func(Scanner) (any, error), args ...interface{}) {
	userEmail, err := ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	projectIDs, err := GetAllProjectsIDsForUser(conn, userEmail, "user")
	if err != nil {
		HandleError(w, err, "Fehler beim Ermitteln der Zugriffsrechte")
		return
	}

	if len(projectIDs) == 0 {
		http.Error(w, "Keine Projektberechtigung", http.StatusForbidden)
		return
	}

	// $-Parameter korrekt positionieren
	projectIDParamPos := len(args) + 1
	var query string
	if strings.Contains(strings.ToLower(baseQuery), "where") {
		query = fmt.Sprintf("%s AND project_id = ANY($%d)", baseQuery, projectIDParamPos)
	} else {
		query = fmt.Sprintf("%s WHERE project_id = ANY($%d)", baseQuery, projectIDParamPos)
	}

	finalArgs := append(args, pq.Array(projectIDs))

	rows, err := conn.Query(query, finalArgs...)
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
