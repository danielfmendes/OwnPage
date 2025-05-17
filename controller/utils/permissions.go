package utils

import (
	"database/sql"
	"fmt"
)

// CanModifyRole prüft, ob actorEmail die Rolle von targetEmail im Projekt ändern darf.
func CanModifyRole(db *sql.DB, actorEmail string, projectID int, targetEmail string, oldRole string, newRole string) error {
	if actorEmail == targetEmail {
		return fmt.Errorf(ErrMsgSelfDelegation)
	}

	actorRole, err := GetUserRole(db, actorEmail, projectID)
	if err != nil {
		return err
	}

	// Keine Rechte vorhanden
	if actorRole == "user" {
		return fmt.Errorf(ErrMsgUserCannotModify)
	}

	// Admin-Einschränkungen
	if actorRole == "admin" {
		if oldRole == "admin" && newRole != "admin" && newRole != "" {
			return fmt.Errorf(ErrMsgAdminCannotBeDegraded)
		}
		if newRole == "creator" {
			return fmt.Errorf(ErrMsgAdminCannotGrantCreator)
		}
		if oldRole == "admin" && newRole == "" {
			return fmt.Errorf(ErrMsgAdminCannotBeDegraded)
		}
	}

	// Creator darf alles
	return nil
}

// GetUserRole holt die Rolle eines Nutzers im Projekt.
func GetUserRole(db *sql.DB, email string, projectID int) (string, error) {
	var role string
	err := db.QueryRow(
		`SELECT role FROM role_management WHERE useremail = $1 AND project_id = $2`,
		email, projectID,
	).Scan(&role)

	if err == sql.ErrNoRows {
		return "", fmt.Errorf(ErrMsgNoPermission)
	} else if err != nil {
		return "", fmt.Errorf("Error retrieving role for %s: %w.", email, err)
	}

	return role, nil
}
