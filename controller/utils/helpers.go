package utils

import (
	"controller/db"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
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

func extractTableFromDeleteQuery(query string) (string, error) {
	re := regexp.MustCompile(`(?i)^DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+WHERE`)
	matches := re.FindStringSubmatch(query)
	if len(matches) != 2 {
		return "", fmt.Errorf("Tabelle konnte nicht aus Query extrahiert werden")
	}
	return matches[1], nil
}

func extractTableFromUpdateQuery(query string) (string, error) {
	re := regexp.MustCompile(`(?i)^UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+SET`)
	matches := re.FindStringSubmatch(query)
	if len(matches) != 2 {
		return "", fmt.Errorf("Tabelle konnte nicht aus UPDATE-Query extrahiert werden")
	}
	return matches[1], nil
}

func extractTableFromInsertQuery(query string) (string, error) {
	re := regexp.MustCompile(`(?i)^INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(`)
	matches := re.FindStringSubmatch(query)
	if len(matches) != 2 {
		return "", fmt.Errorf("Tabelle konnte nicht aus INSERT-Query extrahiert werden")
	}
	return matches[1], nil
}

func MustReadSQLFile(relPath string) string {
	basePath, err := os.Getwd()
	if err != nil {
		log.Fatalf("failed to get working directory: %v", err)
	}

	fullPath := filepath.Join(basePath, relPath)

	content, err := os.ReadFile(fullPath)
	if err != nil {
		log.Fatalf("failed to read SQL file %s: %v", fullPath, err)
	}

	return string(content)
}
