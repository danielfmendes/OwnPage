package utils

import (
	"net/http"
)

func HandleInsert(w http.ResponseWriter, r *http.Request, query string, projectIdentifier interface{}, projectArgs []interface{}, args ...interface{}) error {
	conn, err := ConnectToDB(w)
	if err != nil {
		return err
	}
	defer conn.Close()

	_, err = ValidateProjectAccess(w, r, conn, projectIdentifier, "admin", projectArgs...)
	if err != nil {
		return err
	}

	// INSERT ausführen
	_, err = conn.Exec(query, args...)
	if err != nil {
		HandleError(w, err, ErrMsgInsertRecordFailed)
		return err
	}

	w.WriteHeader(http.StatusCreated)
	return nil
}
