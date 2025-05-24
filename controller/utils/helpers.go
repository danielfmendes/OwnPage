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
		log.Fatal(ErrMsgEmailCredentialsNotSet)
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
		HandleError(w, err, ErrMsgDBConnectionFailed)
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

func ExtractFilterValue(r *http.Request, key string) (string, bool) {
	filter := r.URL.Query().Get("filter")
	if filter == "" {
		return "", false
	}
	parts := strings.Split(filter, ",")
	prefixes := []string{key + ":$eq.", key + ":$in."}

	for _, part := range parts {
		for _, prefix := range prefixes {
			if strings.HasPrefix(part, prefix) {
				return strings.TrimPrefix(part, prefix), true
			}
		}
	}
	return "", false
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
			http.Error(w, ErrMsgCannotRetrieveProjectID, http.StatusBadRequest)
			return false, err
		}
	default:
		http.Error(w, ErrMsgInvalidProjectIdentifier, http.StatusBadRequest)
		return false, fmt.Errorf("invalid projectIdentifier type")
	}

	hasAccess, err := GetProjectIDForUser(conn, userEmail, projectID, role)
	if err != nil {
		HandleError(w, err, ErrMsgAccessCheckFailed)
		return false, err
	}
	if !hasAccess {
		http.Error(w, ErrMsgNoProjectAccess, http.StatusForbidden)
		return false, fmt.Errorf("not authorized")
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
		log.Println("Warning: .env.local could not be opened")
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
