package utils

import (
	"database/sql"
	"errors"
	"fmt"
)

var (
	ErrNoPermission            = errors.New("keine Berechtigung für dieses Projekt")
	ErrAdminCannotBeDegraded   = errors.New("adminrechte dürfen nicht entzogen werden")
	ErrAdminCannotGrantCreator = errors.New("admin darf keine creator-rechte vergeben")
	ErrUserCannotModify        = errors.New("user darf keine Rollen ändern")
	ErrSelfDelegation          = errors.New("eigene Rolle darf nicht verändert werden")
)

// CanModifyRole prüft, ob actorEmail die Rolle von targetEmail im Projekt ändern darf.
func CanModifyRole(db *sql.DB, actorEmail string, projectID int, targetEmail string, oldRole string, newRole string) error {
	if actorEmail == targetEmail {
		return ErrSelfDelegation
	}

	actorRole, err := GetUserRole(db, actorEmail, projectID)
	if err != nil {
		return err
	}

	// Keine Rechte vorhanden
	if actorRole == "user" {
		return ErrUserCannotModify
	}

	// Admin-Einschränkungen
	if actorRole == "admin" {
		if oldRole == "admin" && newRole != "admin" && newRole != "" {
			return ErrAdminCannotBeDegraded
		}
		if newRole == "creator" {
			return ErrAdminCannotGrantCreator
		}
		if oldRole == "admin" && newRole == "" {
			return ErrAdminCannotBeDegraded
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
		return "", ErrNoPermission
	} else if err != nil {
		return "", fmt.Errorf("fehler beim Abrufen der Rolle für %s: %w", email, err)
	}

	return role, nil
}
