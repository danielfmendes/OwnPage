package utils

import (
	"encoding/json"
	"fmt"
	"github.com/lib/pq"
	"net/http"
	"regexp"
	"strconv"
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

	// Hole alle Projekt-IDs, für die der Nutzer Zugriff hat
	userProjectIDs, err := GetAllProjectsIDsForUser(conn, userEmail, "user")
	if err != nil {
		HandleError(w, err, "Fehler beim Ermitteln der Zugriffsrechte")
		return
	}

	if len(userProjectIDs) == 0 {
		http.Error(w, "Keine Projektberechtigung", http.StatusForbidden)
		return
	}

	// Prüfe, ob project_id als URL-Parameter gesetzt ist
	queryParam := r.URL.Query().Get("project_id")
	var effectiveProjectIDs []int

	if queryParam != "" {
		requestedIDs := []int{}
		for _, idStr := range strings.Split(queryParam, "|") {
			if idStr == "" {
				continue
			}
			id, err := strconv.Atoi(idStr)
			if err != nil {
				http.Error(w, "Ungültige project_id-Parameter", http.StatusBadRequest)
				return
			}
			requestedIDs = append(requestedIDs, id)
		}

		// Filter: nur IDs nehmen, für die der Nutzer Zugriff hat
		allowed := map[int]bool{}
		for _, id := range userProjectIDs {
			allowed[id] = true
		}
		for _, id := range requestedIDs {
			if allowed[id] {
				effectiveProjectIDs = append(effectiveProjectIDs, id)
			}
		}

		if len(effectiveProjectIDs) == 0 {
			http.Error(w, "Keine Berechtigung für angegebene Projekt-IDs", http.StatusForbidden)
			return
		}
	} else {
		effectiveProjectIDs = userProjectIDs
	}

	lowerQuery := strings.ToLower(baseQuery)
	query := baseQuery
	finalArgs := args

	// Regex: prüft, ob "project_id" im WHERE-Teil steht
	projectIDRegex := regexp.MustCompile(`(?i)where\s+.*\bproject[_]?id\b`)

	if !projectIDRegex.MatchString(lowerQuery) {
		projectIDParamPos := len(args) + 1
		if strings.Contains(lowerQuery, "where") {
			query = fmt.Sprintf("%s AND project_id = ANY($%d)", baseQuery, projectIDParamPos)
		} else {
			query = fmt.Sprintf("%s WHERE project_id = ANY($%d)", baseQuery, projectIDParamPos)
		}
	}

	// Füge Projekt-IDs als letzten Parameter hinzu
	finalArgs = append(finalArgs, pq.Array(effectiveProjectIDs))

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
