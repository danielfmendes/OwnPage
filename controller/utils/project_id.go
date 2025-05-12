package utils

import (
	"database/sql"
	"fmt"
	"strings"
)

// Rollen-Hierarchie: creator > admin > user
var rolePriority = map[string]int{
	"user":    1,
	"admin":   2,
	"creator": 3,
}

// Gibt true zurück, wenn der Nutzer mindestens die geforderte Rolle hat
func GetProjectIDForUser(conn *sql.DB, email string, projectID int, requiredRole string) (bool, error) {
	var userRole string
	err := conn.QueryRow(`
		SELECT role
		FROM role_management
		WHERE useremail = $1 AND projectid = $2
	`, email, projectID).Scan(&userRole)

	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, err
	}

	if hasSufficientRole(userRole, requiredRole) {
		return true, nil
	}
	return false, nil
}

// Gibt alle Projekt-IDs zurück, bei denen der Nutzer mindestens die geforderte Rolle hat
func GetAllProjectsIDsForUser(conn *sql.DB, email string, requiredRole string) ([]int, error) {
	allowedRoles, err := getAllowedRoles(requiredRole)
	if err != nil {
		return nil, err
	}

	query := fmt.Sprintf(`
		SELECT projectid
		FROM role_management
		WHERE useremail = $1 AND role IN (%s)
	`, strings.Join(allowedRoles, ","))

	rows, err := conn.Query(query, email)
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
	return projectIDs, rows.Err()
}

// Gibt true zurück, wenn die aktuelle Rolle >= benötigte Rolle ist
func hasSufficientRole(current, required string) bool {
	return rolePriority[current] >= rolePriority[required]
}

// Gibt Liste erlaubter Rollen für eine geforderte Rolle zurück
func getAllowedRoles(requiredRole string) ([]string, error) {
	requiredLevel, ok := rolePriority[requiredRole]
	if !ok {
		return nil, fmt.Errorf("Ungültige Rolle: %s", requiredRole)
	}

	var roles []string
	for role, level := range rolePriority {
		if level >= requiredLevel {
			roles = append(roles, fmt.Sprintf("'%s'", role))
		}
	}
	return roles, nil
}
