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
		HandleError(w, err, ErrMsgDBQueryFailed)
		return
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		item, err := scanFunc(rows)
		if err != nil {
			HandleError(w, err, ErrMsgScanFailed)
			return
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		HandleError(w, err, ErrMsgRowsReadFailed)
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

	// Hole alle zulässigen Projekt-IDs für den Benutzer
	userProjectIDs, err := GetAllProjectsIDsForUser(conn, userEmail, "user")
	if err != nil {
		HandleError(w, err, ErrMsgNoProjectAccess)
		return
	}

	// Effektive Projekt-IDs basierend auf URL-Parameter und Berechtigungen
	effectiveProjectIDs, err := filterProjectIDs(r, userProjectIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	// Final Query zusammenbauen
	finalQuery, finalArgs := injectProjectIDFilter(baseQuery, args, effectiveProjectIDs)

	rows, err := conn.Query(finalQuery, finalArgs...)
	if err != nil {
		HandleError(w, err, ErrMsgDBQueryFailed)
		return
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		item, err := scanFunc(rows)
		if err != nil {
			HandleError(w, err, ErrMsgScanFailed)
			return
		}
		results = append(results, item)
	}

	if err := rows.Err(); err != nil {
		HandleError(w, err, ErrMsgRowsReadFailed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func filterProjectIDs(r *http.Request, allowedIDs []int) ([]int, error) {
	filterValue, found := ExtractFilterValue(r, "project_id")
	if !found {
		return allowedIDs, nil
	}

	var requestedIDs []int
	if strings.Contains(filterValue, "|") {
		// $in-ähnliche IDs, pipe-separiert
		idStrs := strings.Split(filterValue, "|")
		for _, s := range idStrs {
			id, err := strconv.Atoi(s)
			if err != nil {
				return nil, fmt.Errorf(ErrMsgInvalidProjectIDParam)
			}
			requestedIDs = append(requestedIDs, id)
		}
	} else {
		// Einzelner Wert, $eq
		id, err := strconv.Atoi(filterValue)
		if err != nil {
			return nil, fmt.Errorf(ErrMsgInvalidProjectIDParam)
		}
		requestedIDs = []int{id}
	}

	// Erlaube nur IDs, auf die der Nutzer Zugriff hat
	allowedMap := make(map[int]struct{}, len(allowedIDs))
	for _, id := range allowedIDs {
		allowedMap[id] = struct{}{}
	}

	var filtered []int
	for _, id := range requestedIDs {
		if _, ok := allowedMap[id]; ok {
			filtered = append(filtered, id)
		}
	}

	if len(filtered) == 0 {
		return nil, fmt.Errorf(ErrMsgNoPermissionForProjectIDs)
	}
	return filtered, nil
}

func injectProjectIDFilter(query string, args []interface{}, projectIDs []int) (string, []interface{}) {
	lowerQuery := strings.ToLower(query)
	paramIndex := len(args) + 1

	// Regex prüft, ob WHERE ... project_id bereits existiert
	projectIDRegex := regexp.MustCompile(`(?i)where\s+.*\bproject[_]?id\b`)
	if !projectIDRegex.MatchString(lowerQuery) {
		if strings.Contains(lowerQuery, "where") {
			query += fmt.Sprintf(" AND project_id = ANY($%d)", paramIndex)
		} else {
			query += fmt.Sprintf(" WHERE project_id = ANY($%d)", paramIndex)
		}
	}

	args = append(args, pq.Array(projectIDs))
	return query, args
}
