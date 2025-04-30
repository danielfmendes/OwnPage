package db

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

var DB *sql.DB

func Connect() {
	var err error
	DB, err = sql.Open("postgres", "host=localhost port=5433 user=fahrrad_user password=geheim dbname=fahrrad_db sslmode=disable")
	if err != nil {
		log.Fatal("DB-Verbindung fehlgeschlagen: ", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("DB nicht erreichbar: ", err)
	}

	log.Println("DB-Verbindung erfolgreich")
}
