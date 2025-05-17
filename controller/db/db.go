package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_PUBLIC_URL")
	if connStr == "" {
		log.Println("Database Public URL not set, using default connection string")
		connStr = "host=localhost port=5433 user=fahrrad_user password=geheim dbname=fahrrad_db sslmode=disable"
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	return db, nil
}
