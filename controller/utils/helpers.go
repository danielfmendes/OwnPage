package utils

import (
	"controller/db"
	"database/sql"
	"log"
	"net/http"
)

func ConnectToDB(w http.ResponseWriter) (*sql.DB, error) {
	conn, err := db.Connect()
	if err != nil {
		HandleError(w, err, "Datenbankverbindung fehlgeschlagen")
		return nil, err
	}
	return conn, nil
}

func HandleError(w http.ResponseWriter, err error, message string) {
	if err != nil {
		http.Error(w, message, http.StatusInternalServerError)
		log.Println(message+":", err)
	}
}
