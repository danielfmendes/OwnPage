package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"fmt"
	"github.com/lib/pq"
	"log"
	"net/http"
)

func RoleManagementHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		requiredRole := r.URL.Query().Get("requiredRole")
		if requiredRole != "" {
			GetProjectsForUserByRole(w, r)
		} else {
			GetRoleManagement(w, r)
		}
	case http.MethodPost:
		InsertProject(w, r)
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func GetProjectsForUserByRole(w http.ResponseWriter, r *http.Request) {
	requiredRole := r.URL.Query().Get("requiredRole")

	// Token validieren und E-Mail extrahieren
	userEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	// DB-Verbindung aufbauen
	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	// Projekt-IDs abrufen
	projectIDs, err := utils.GetAllProjectsIDsForUser(conn, userEmail, requiredRole)
	if err != nil {
		utils.HandleError(w, err, "Fehler beim Abrufen der Projekt-IDs")
		return
	}

	if len(projectIDs) == 0 {
		// Leeres Ergebnis
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
		return
	}

	// Nutze deine zentrale HandleGet-Methode zur Ausgabe
	query := `
		SELECT id, name
		FROM projects
		WHERE id = ANY($1)
	`
	utils.HandleGet(w, r, query, func(scanner utils.Scanner) (any, error) {
		var p models.Project
		err := scanner.Scan(&p.ID, &p.Name)
		return p, err
	}, pq.Array(projectIDs))
}

func GetRoleManagement(w http.ResponseWriter, r *http.Request) {
	userEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	log.Printf("→ GetRoleManagement: Daten werden geladen für Benutzer %s\n", userEmail)

	utils.HandleGet(w, r, `
		SELECT useremail, projectid, role, name
		FROM role_management
		JOIN public.projects p ON p.id = role_management.projectid
		WHERE role_management.useremail = $1
	`, func(scanner utils.Scanner) (any, error) {
		var p models.RoleManagementWithName
		err := scanner.Scan(&p.UserEmail, &p.ProjectID, &p.Role, &p.ProjectName)
		return p, err
	}, userEmail)
}

func InsertProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Nur POST erlaubt", http.StatusMethodNotAllowed)
		return
	}

	// JSON-Daten einlesen
	var project models.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, "Ungültige JSON-Daten", http.StatusBadRequest)
		return
	}

	// Benutzer aus Token validieren
	userEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return // Fehler bereits behandelt
	}

	// DB-Verbindung aufbauen
	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	// Projekt einfügen und ID zurückholen
	var projectID int
	err = conn.QueryRow(`
		INSERT INTO projects (name)
		VALUES ($1)
		RETURNING id
	`, project.Name).Scan(&projectID)
	if err != nil {
		utils.HandleError(w, err, "Fehler beim Einfügen des Projekts")
		return
	}

	// Rolle für Benutzer als "creator" setzen
	_, err = conn.Exec(`
		INSERT INTO role_management (useremail, projectid, role)
		VALUES ($1, $2, 'creator')
	`, userEmail, projectID)
	if err != nil {
		utils.HandleError(w, err, "Fehler beim Setzen der Rolle")
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, `{"project_id": %d}`, projectID)
}
