package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// Connect establishes a connection to the PostgreSQL database.
// It uses DATABASE_PUBLIC_URL if available, otherwise falls back to a local default.
func Connect() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_PUBLIC_URL")

	if connStr == "" {
		log.Println("DATABASE_PUBLIC_URL not set, using fallback connection string")

		// Use port 5432 in CI, otherwise use 5433 locally
		port := "5433"
		if os.Getenv("CI") == "true" {
			port = "5432"
		}

		connStr = fmt.Sprintf(
			"host=localhost port=%s user=fahrrad_user password=geheim dbname=fahrrad_db sslmode=disable",
			port,
		)
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// Optionally check the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}
