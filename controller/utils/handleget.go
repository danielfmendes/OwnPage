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
	filterParam := r.URL.Query().Get("filter")
	if filterParam == "" {
		return allowedIDs, nil
	}

	// Beispiel filterParam: "project_id:$eq.2" oder "project_id:$in.1|2|3,customer_id:$eq.5"
	filters := strings.Split(filterParam, ",")
	var projectFilter string
	for _, f := range filters {
		if strings.HasPrefix(f, "project_id:") {
			projectFilter = f
			break
		}
	}

	if projectFilter == "" {
		return allowedIDs, nil
	}

	filterValue := strings.TrimPrefix(projectFilter, "project_id:")

	var requestedIDs []int
	if strings.HasPrefix(filterValue, "$eq.") {
		// Single ID
		idStr := strings.TrimPrefix(filterValue, "$eq.")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			return nil, fmt.Errorf(ErrMsgInvalidProjectIDParam)
		}
		requestedIDs = []int{id}
	} else if strings.HasPrefix(filterValue, "$in.") {
		// Mehrere IDs, pipe-separiert
		idStrs := strings.Split(strings.TrimPrefix(filterValue, "$in."), "|")
		for _, s := range idStrs {
			id, err := strconv.Atoi(s)
			if err != nil {
				return nil, fmt.Errorf(ErrMsgInvalidProjectIDParam)
			}
			requestedIDs = append(requestedIDs, id)
		}
	} else {
		return nil, fmt.Errorf(ErrMsgInvalidProjectIDParam)
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
