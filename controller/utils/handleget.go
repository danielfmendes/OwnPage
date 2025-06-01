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
	fetchData(w, r, query, false, false, scanFunc, args...)
}

func HandleGetWithPagination(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	handleFetchWithOptionalCountBy(w, r, query, false, scanFunc, args...)
}

func HandleGetWithProjectIDs(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	fetchData(w, r, query, true, false, scanFunc, args...)
}

func HandleGetForDataTable(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	scanFunc func(Scanner) (any, error),
	args ...interface{},
) {
	handleFetchWithOptionalCountBy(w, r, query, true, scanFunc, args...)
}

func handleFetchWithOptionalCountBy(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	withProjectIDs bool,
	defaultScan func(Scanner) (any, error),
	args ...interface{},
) {
	countBy := r.URL.Query().Get("countBy")
	if countBy != "" {
		scanFuncCount := func(scanner Scanner) (any, error) {
			var value string
			var count int
			if err := scanner.Scan(&value, &count); err != nil {
				return nil, err
			}
			return map[string]any{
				"value": value,
				"count": count,
			}, nil
		}
		fetchData(w, r, query, withProjectIDs, false, scanFuncCount, args...)
	} else {
		fetchData(w, r, query, withProjectIDs, true, defaultScan, args...)
	}
}

func fetchData(
	w http.ResponseWriter,
	r *http.Request,
	query string,
	filterWithProjectIDs bool,
	applyAllDataFeatures bool,
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

	// Project ID Filter, wenn aktiviert
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

		finalQuery, finalArgs = injectProjectIDFilter(finalQuery, finalArgs, effectiveProjectIDs)
	}

	// Generic Filter immer anwenden, wenn countBy gesetzt ist oder applyAllDataFeatures true ist
	countBy := r.URL.Query().Get("countBy")
	if countBy != "" || applyAllDataFeatures {
		finalQuery, finalArgs, err = applyGenericFilters(r, finalQuery, finalArgs)
		if err != nil {
			http.Error(w, "Invalid filter parameters: "+err.Error(), http.StatusBadRequest)
			return
		}
	}

	if countBy != "" {
		re := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
		if !re.MatchString(countBy) {
			http.Error(w, "Invalid countBy parameter", http.StatusBadRequest)
			return
		}

		countByQuery := fmt.Sprintf(
			"SELECT %s AS value, COUNT(*) AS count FROM (%s) AS subquery GROUP BY %s ORDER BY count DESC",
			countBy, finalQuery, countBy,
		)

		rows, err := conn.Query(countByQuery, finalArgs...)
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
		return
	}

	applyPagination := false
	includeTotalCount := false
	if applyAllDataFeatures {
		applyPagination = true
		includeTotalCount = true
	}

	// Total Count abfragen, wenn gewünscht
	var totalCount int
	if includeTotalCount {
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM (%s) AS count_sub", finalQuery)
		if err := conn.QueryRow(countQuery, finalArgs...).Scan(&totalCount); err != nil {
			HandleError(w, err, "Failed to count total items")
			return
		}
	}

	// Pagination & Sorting anwenden, wenn aktiviert
	if applyPagination {
		finalQuery, err = applyPaginationAndSorting(finalQuery, r)
		if err != nil {
			HandleError(w, err, "Invalid pagination or sorting parameters")
			return
		}
	}

	// Query ausführen
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
		if results == nil || len(results) == 0 {
			http.Error(w, "No results found", http.StatusNotFound)
			return
		}
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
	page := 1 // <- Default page = 1 (1-basiert)

	// Query Params lesen
	if ps := r.URL.Query().Get("pageSize"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil && v > 0 && v <= 1000 {
			pageSize = v
		}
	}
	if p := r.URL.Query().Get("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v >= 1 {
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

	offset := (page - 1) * pageSize
	limitOffsetClause := fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, offset)
	finalQuery := baseQuery + orderClause + limitOffsetClause

	return finalQuery, nil
}

func applyGenericFilters(r *http.Request, baseQuery string, args []interface{}) (string, []interface{}, error) {
	filter := r.URL.Query().Get("filter")
	if filter == "" {
		return baseQuery, args, nil
	}

	parts := strings.Split(filter, ",")
	var filters []string
	var newArgs = args

	for _, part := range parts {
		if strings.HasPrefix(part, "project_id:") {
			// project_id wird separat behandelt
			continue
		}

		if strings.HasPrefix(part, "$") {
			continue // ungültiger Schlüsselname
		}

		if strings.Contains(part, ":$eq.") {
			key := strings.Split(part, ":$eq.")[0]
			val := strings.TrimPrefix(part, key+":$eq.")
			filters = append(filters, fmt.Sprintf(`%s = $%d`, key, len(newArgs)+1))
			newArgs = append(newArgs, val)
		} else if strings.Contains(part, ":$in.") {
			key := strings.Split(part, ":$in.")[0]
			rawVals := strings.TrimPrefix(part, key+":$in.")
			splitVals := strings.Split(rawVals, "|")
			filters = append(filters, fmt.Sprintf(`%s = ANY($%d)`, key, len(newArgs)+1))
			newArgs = append(newArgs, pq.Array(splitVals))
		} else if strings.Contains(part, ":$between.") {
			key := strings.Split(part, ":$between.")[0]
			vals := strings.TrimPrefix(part, key+":$between.")
			splitVals := strings.Split(vals, "|")
			if len(splitVals) != 2 {
				return "", nil, fmt.Errorf("invalid $between format: %s", part)
			}
			from := splitVals[0]
			to := splitVals[1]
			filters = append(filters, fmt.Sprintf(`%s BETWEEN $%d AND $%d`, key, len(newArgs)+1, len(newArgs)+2))
			newArgs = append(newArgs, from, to)
		} else {
			return "", nil, fmt.Errorf("unsupported filter format: %s", part)
		}
	}

	if len(filters) == 0 {
		return baseQuery, args, nil
	}

	// Wrap in subquery
	filterClause := " WHERE " + strings.Join(filters, " AND ")
	finalQuery := fmt.Sprintf("SELECT * FROM (%s) AS subquery%s", baseQuery, filterClause)

	return finalQuery, newArgs, nil
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
