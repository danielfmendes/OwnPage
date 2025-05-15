package utils

import (
	"net/http"
)

func HandleUpdate(w http.ResponseWriter, r *http.Request, query string, projectIdentifier interface{}, projectArgs []interface{}, queryArgs ...interface{}) error {
	conn, err := ConnectToDB(w)
	if err != nil {
		return err
	}
	defer conn.Close()

	_, err = ValidateProjectAccess(w, r, conn, projectIdentifier, "admin", projectArgs...)
	if err != nil {
		return err
	}

	// Update durchführen
	_, err = conn.Exec(query, queryArgs...)
	if err != nil {
		HandleError(w, err, "Fehler beim Aktualisieren des Datensatzes")
		return err
	}

	w.WriteHeader(http.StatusNoContent)
	return nil
}
