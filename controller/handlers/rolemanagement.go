package handlers

import (
	"controller/models"
	"controller/utils"
	"github.com/lib/pq"
	"net/http"
)

func GetProjectsForUserByRole(w http.ResponseWriter, r *http.Request) {
	requiredRole := r.URL.Query().Get("requiredRole")
	if requiredRole == "" {
		http.Error(w, "Required Role fehlt", http.StatusBadRequest)
		return
	}

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
