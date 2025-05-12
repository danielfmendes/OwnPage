package utils

import (
	"fmt"
	"net/http"
)

func HandleInsert(w http.ResponseWriter, r *http.Request, query string, args ...interface{}) error {
	userEmail, err := ValidateToken(w, r)
	if err != nil {
		return err
	}

	conn, err := ConnectToDB(w)
	if err != nil {
		return err
	}
	defer conn.Close()

	if len(args) == 0 {
		http.Error(w, "Fehlender Parameter: project_id", http.StatusBadRequest)
		return fmt.Errorf("keine Argumente übergeben")
	}
	projectID, ok := args[0].(int)
	if !ok {
		http.Error(w, "Ungültige Projekt-ID", http.StatusBadRequest)
		return fmt.Errorf("ungültiger Typ für project_id")
	}

	// Rechte prüfen
	hasAccess, err := GetProjectIDForUser(conn, userEmail, projectID, "admin")
	if err != nil {
		HandleError(w, err, "Fehler bei der Rechteprüfung")
		return err
	}
	if !hasAccess {
		http.Error(w, "Keine Adminrechte für dieses Projekt", http.StatusForbidden)
		return fmt.Errorf("nicht berechtigt")
	}

	// INSERT ausführen
	_, err = conn.Exec(query, args...)
	if err != nil {
		HandleError(w, err, "Fehler beim Einfügen des Datensatzes")
		return err
	}

	w.WriteHeader(http.StatusCreated)
	return nil
}
