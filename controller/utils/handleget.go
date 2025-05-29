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

func HandleGet(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	fetchData(w, r, query, false, false, false, scanFunc, args...)
}

func HandleGetWithPagination(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	fetchData(w, r, query, false, true, true, scanFunc, args...)
}

func HandleGetWithProjectIDs(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	fetchData(w, r, query, true, false, false, scanFunc, args...)
}

func HandleGetWithProjectIDsWithPagination(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	fetchData(w, r, query, true, true, true, scanFunc, args...)
}

func fetchData(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	filterWithProjectIDs bool,
	applyPagination bool,
	includeTotalCount bool,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	_, err := ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	finalQuery := query
	finalArgs := args

	if filterWithProjectIDs {
		userEmail, err := ValidateToken(w, r)
		if err != nil {
			return
		}

		userProjectIDs, err := GetAllProjectsIDsForUser(conn, userEmail, "user")
		if err != nil {
			HandleError(w, err, ErrMsgNoProjectAccess)
			return
		}

		effectiveProjectIDs, err := filterProjectIDs(r, userProjectIDs)
		if err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}

		finalQuery, finalArgs = injectProjectIDFilter(query, args, effectiveProjectIDs)
	}

	var totalCount int
	if includeTotalCount {
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM (%s) AS count_sub", finalQuery)
		if err := conn.QueryRow(countQuery, finalArgs...).Scan(&totalCount); err != nil {
			HandleError(w, err, "Failed to count total items")
			return
		}
	}

	if applyPagination {
		finalQuery, err = applyPaginationAndSorting(finalQuery, r)
		if err != nil {
			HandleError(w, err, "Invalid pagination or sorting parameters")
			return
		}
	}

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
	if includeTotalCount {
		json.NewEncoder(w).Encode(map[string]any{
			"totalCount": totalCount,
			"items":      results,
		})
	} else {
		json.NewEncoder(w).Encode(results)
	}
}

func applyPaginationAndSorting(baseQuery string, r *http.Request) (string, error) {
	queryParams := r.URL.Query()

	// Check if any relevant params are set
	hasPageSize := queryParams.Has("pageSize")
	hasPage := queryParams.Has("page")
	hasOrderBy := queryParams.Has("orderBy")

	// If nothing is set, return the original baseQuery unchanged
	if !hasPageSize && !hasPage && !hasOrderBy {
		return baseQuery, nil
	}

	// Pagination Defaults
	pageSize := 25
	page := 0

	// Query Params lesen
	if ps := r.URL.Query().Get("pageSize"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil && v > 0 && v <= 1000 {
			pageSize = v
		}
	}
	if p := r.URL.Query().Get("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v >= 0 {
			page = v
		}
	}

	orderBy := r.URL.Query().Get("orderBy")
	orderClause := ""
	if orderBy != "" {
		orderBy = strings.ReplaceAll(orderBy, "=", " ")   // z.B. "customer_name=asc" -> "customer_name asc"
		orderBy = strings.ReplaceAll(orderBy, "%20", " ") // URL decoded space fallback (optional)
		orderClause = " ORDER BY " + orderBy
	}

	limitOffsetClause := fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, page*pageSize)
	finalQuery := baseQuery + orderClause + limitOffsetClause

	return finalQuery, nil
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
