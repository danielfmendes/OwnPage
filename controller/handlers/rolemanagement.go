package handlers

import (
	"controller/models"
	"controller/utils"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

func RoleManagementHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		GetRoleManagement(w, r)
	case http.MethodDelete:
		DeleteRoleManagement(w, r)
	case http.MethodPut:
		UpdateRoleManagement(w, r)
	case http.MethodPost:
		InsertRoleManagement(w, r)
	default:
		http.Error(w, utils.ErrMsgMethodNotAllowed, http.StatusMethodNotAllowed)
	}
}

func GetRoleManagementByID(w http.ResponseWriter, r *http.Request) {
	// Beispiel: /rolemanagements/3 → wir wollen nur die "3"
	path := strings.TrimPrefix(r.URL.Path, "/rolemanagements/")
	if path == "" || strings.Contains(path, "/") {
		http.Error(w, utils.ErrMsgIDMissingOrInvalid, http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	query := `SELECT * FROM role_management WHERE project_id = $1`

	utils.HandleGet(w, r, query, func(scanner utils.Scanner) (any, error) {
		var roles models.RoleManagement
		err := scanner.Scan(&roles.UserEmail, &roles.ProjectID, &roles.Role)
		return roles, err
	}, id)
}

func GetRoleManagement(w http.ResponseWriter, r *http.Request) {
	userEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	utils.HandleGetWithPagination(w, r, `
		SELECT useremail, project_id, role, name
		FROM role_management
		JOIN public.projects p ON p.id = role_management.project_id
		WHERE role_management.useremail = $1
	`, func(scanner utils.Scanner) (any, error) {
		var p models.RoleManagementWithName
		err := scanner.Scan(&p.UserEmail, &p.ProjectID, &p.Role, &p.ProjectName)
		return p, err
	}, userEmail)
}

func DeleteRoleManagement(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	projectIDStr := r.URL.Query().Get("project_id")

	if email == "" || projectIDStr == "" {
		http.Error(w, "Email and ProjectID must be specified.", http.StatusBadRequest)
		return
	}

	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		http.Error(w, utils.ErrMsgIdInvalid, http.StatusBadRequest)
		return
	}

	requesterEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	var currentRole string
	err = conn.QueryRow(
		`SELECT role FROM role_management WHERE useremail = $1 AND project_id = $2`,
		email, projectID,
	).Scan(&currentRole)
	if err == sql.ErrNoRows {
		http.Error(w, "Entry not found.", http.StatusNotFound)
		return
	} else if err != nil {
		utils.HandleError(w, err, utils.ErrMsgErrorFetchingCurrentRole)
		return
	}

	if err := utils.CanModifyRole(conn, requesterEmail, projectID, email, currentRole, ""); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	projectIdQuery := "SELECT project_id FROM role_management WHERE project_id = $1 AND useremail = $2"
	utils.HandleDelete(w, r, "DELETE FROM role_management WHERE project_id = $1 AND useremail = $2", []string{}, projectIdQuery, []interface{}{projectID, email}, projectID, email)
}

func UpdateRoleManagement(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, utils.ErrMsgMethodPUTOnly, http.StatusMethodNotAllowed)
		return
	}

	var role models.RoleManagement
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	requesterEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	db, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer db.Close()

	var currentRole string
	err = db.QueryRow(
		`SELECT role FROM role_management WHERE useremail = $1 AND project_id = $2`,
		role.UserEmail, role.ProjectID,
	).Scan(&currentRole)
	if err == sql.ErrNoRows {
		http.Error(w, "Entry not found.", http.StatusNotFound)
		return
	} else if err != nil {
		utils.HandleError(w, err, utils.ErrMsgErrorFetchingCurrentRole)
		return
	}

	if err := utils.CanModifyRole(db, requesterEmail, role.ProjectID, role.UserEmail, currentRole, role.Role); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if currentRole == role.Role {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	_, err = db.Exec(
		`UPDATE role_management SET role = $1 WHERE useremail = $2 AND project_id = $3`,
		role.Role, role.UserEmail, role.ProjectID,
	)
	if err != nil {
		utils.HandleError(w, err, utils.ErrMsgErrorUpdatingRole)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func InsertRoleManagement(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	var role models.RoleManagement
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, utils.ErrMsgProcessingRequest, http.StatusBadRequest)
		return
	}

	requesterEmail, err := utils.ValidateToken(w, r)
	if err != nil {
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	// Schritt 1: Überprüfen, ob der anfragende Benutzer die Berechtigung hat
	if err := utils.CanModifyRole(conn, requesterEmail, role.ProjectID, role.UserEmail, "", role.Role); err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	// Schritt 2: Überprüfen, ob der Benutzer existiert
	var userExists bool
	err = conn.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", role.UserEmail).Scan(&userExists)
	if err != nil {
		http.Error(w, utils.ErrMsgErrorCheckingUser, http.StatusInternalServerError)
		return
	}
	if !userExists {
		http.Error(w, "User does not exist.", http.StatusBadRequest)
		return
	}

	// Schritt 3: Überprüfen, ob der Benutzer bereits zugewiesen ist
	var roleExists bool
	err = conn.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM role_management WHERE useremail = $1 AND project_id = $2)",
		role.UserEmail, role.ProjectID,
	).Scan(&roleExists)
	if err != nil {
		http.Error(w, utils.ErrMsgErrorCheckingRoleAssignment, http.StatusInternalServerError)
		return
	}
	if roleExists {
		http.Error(w, "User is already assigned to this project.", http.StatusConflict)
		return
	}

	// Schritt 4: Einfügen der neuen Rolle
	query := `INSERT INTO role_management (project_id, useremail, role) VALUES ($1, $2, $3)`
	args := []any{role.ProjectID, role.UserEmail, role.Role}
	err = utils.HandleInsert(w, r, query, role.ProjectID, nil, args...)
}
