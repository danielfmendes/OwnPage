package utils

import (
	"database/sql"
	"fmt"
)

func GetProjectIDForUser(conn *sql.DB, email string, projectID int, requiredRole string) (bool, error) {
	var userRole string
	err := conn.QueryRow(`
		SELECT role
		FROM role_management
		WHERE useremail = $1 AND projectid = $2
	`, email, projectID).Scan(&userRole)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // Keine Rolle → kein Zugriff
		}
		return false, err // Anderer Fehler
	}

	// "admin" hat immer Zugriff, auch wenn "user" verlangt wird
	if userRole == "admin" || userRole == requiredRole {
		return true, nil
	}

	return false, nil
}

func GetAllProjectsIDsForUser(conn *sql.DB, email string, requiredRole string) ([]int, error) {
	var rows *sql.Rows
	var err error

	switch requiredRole {
	case "admin":
		// Nur Projekte, wo der Nutzer admin ist
		rows, err = conn.Query(`
			SELECT projectid
			FROM role_management
			WHERE useremail = $1 AND role = 'admin'
		`, email)
	case "user":
		// Alle Projekte, wo der Nutzer user oder admin ist
		rows, err = conn.Query(`
			SELECT projectid
			FROM role_management
			WHERE useremail = $1 AND role IN ('user', 'admin')
		`, email)
	default:
		return nil, fmt.Errorf("Ungültige Rolle: %s", requiredRole)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projectIDs []int
	for rows.Next() {
		var pid int
		if err := rows.Scan(&pid); err != nil {
			return nil, err
		}
		projectIDs = append(projectIDs, pid)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projectIDs, nil
}
