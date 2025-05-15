package utils

import (
	"bufio"
	"controller/db"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// GetAllowedOrigins bestimmt die erlaubten CORS-Ursprünge basierend auf der Umgebung
func GetAllowedOrigins() []string {
	connStr := os.Getenv("DATABASE_PUBLIC_URL")
	if connStr == "" {
		return []string{"http://localhost:3000"}
	}
	return []string{"https://www.danielfreiremendes.com"}
}

// GetBackendBaseURL gibt die Basis-URL des Backends zurück
func GetBackendBaseURL() string {
	url := os.Getenv("BACKEND_BASE_URL")
	if url == "" {
		return "http://localhost:8080"
	}
	return url
}

func GetEmailCredentials() (from, pass string) {
	// Erst aus Umgebungsvariablen lesen
	from = os.Getenv("EMAIL_FROM")
	pass = os.Getenv("EMAIL_PASS")

	// Falls leer, versuche aus .env.local manuell zu lesen
	if from == "" || pass == "" {
		loadEnvFile(".env.local")

		from = os.Getenv("EMAIL_FROM")
		pass = os.Getenv("EMAIL_PASS")
	}

	if from == "" || pass == "" {
		log.Fatal("EMAIL_FROM oder EMAIL_PASS ist nicht gesetzt")
	}

	return
}

func GenerateVerificationToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		// Fallback falls etwas schiefläuft
		return "fallbacktoken"
	}
	return hex.EncodeToString(b)
}

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

// ValidateProjectAccess überprüft, ob der User Zugriff auf das Projekt mit bestimmter Rolle hat.
// projectIdentifier: int (direkte ID) oder string (Query, die project_id liefert)
// Gibt: projectID, ggf. Fehler
func ValidateProjectAccess(w http.ResponseWriter, r *http.Request, conn *sql.DB, projectIdentifier interface{}, role string, args ...interface{}) (bool, error) {
	userEmail, err := ValidateToken(w, r)
	if err != nil {
		return false, err
	}

	var projectID int

	switch v := projectIdentifier.(type) {
	case int:
		projectID = v
	case string:
		err := conn.QueryRow(v, args...).Scan(&projectID)
		if err != nil {
			http.Error(w, "Konnte project_id aus Query nicht ermitteln", http.StatusBadRequest)
			return false, err
		}
	default:
		http.Error(w, "Ungültiger Typ für projectIdentifier", http.StatusBadRequest)
		return false, fmt.Errorf("ungültiger Typ für projectIdentifier")
	}

	hasAccess, err := GetProjectIDForUser(conn, userEmail, projectID, role)
	if err != nil {
		HandleError(w, err, "Fehler bei der Rechteprüfung")
		return false, err
	}
	if !hasAccess {
		http.Error(w, "Keine Berechtigung für dieses Projekt", http.StatusForbidden)
		return false, fmt.Errorf("nicht berechtigt")
	}

	return true, nil
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

func loadEnvFile(path string) {
	file, err := os.Open(path)
	if err != nil {
		log.Println("Warnung: .env.local konnte nicht geöffnet werden")
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		// Parsen: KEY=VALUE
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		os.Setenv(key, value)
	}
}
