package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"time"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM users", func(scanner utils.Scanner) (any, error) {
		var user models.User
		err := scanner.Scan(&user.Username, &user.Dob, &user.Email, &user.Password)
		return user, err
	})
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email fehlt", http.StatusBadRequest)
		return
	}

	// SQL-Abfrage zum Abrufen des Benutzers basierend auf der E-Mail-Adresse
	query := `SELECT username, dob, email, password FROM users WHERE email = $1`

	// Die HandleGet-Funktion wird verwendet, um die Abfrage auszuführen und den Benutzer abzurufen
	utils.HandleGet(w, r, query, func(scanner utils.Scanner) (any, error) {
		var user models.User
		err := scanner.Scan(&user.Username, &user.Dob, &user.Email, &user.Password)
		return user, err
	}, email)
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Nur POST erlaubt", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.HandleError(w, err, "Ungültiger Request Body")
		return
	}

	// Geburtsdatum parsen
	dob, err := time.Parse("2006-01-02", user.Dob.Format("2006-01-02"))
	if err != nil {
		utils.HandleError(w, err, "Ungültiges Geburtsdatum")
		return
	}

	// Passwort hashen
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.HandleError(w, err, "Fehler beim Hashen des Passworts")
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	query := `INSERT INTO users (username, email, password, dob) VALUES ($1, $2, $3, $4)`
	_, err = conn.Exec(query, user.Username, user.Email, string(hashedPassword), dob)
	if err != nil {
		utils.HandleError(w, err, "Fehler beim Einfügen in die Datenbank")
		return
	}

	// JWT-Token erstellen
	tokenString, err := utils.CreateJWT(user.Email)
	if err != nil {
		http.Error(w, "Fehler beim Erstellen des Tokens", http.StatusInternalServerError)
		return
	}

	// Antwort mit Token zurückgeben
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Registrierung erfolgreich",
		"token":   tokenString,
	})
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Nur POST erlaubt", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.HandleError(w, err, "Ungültiger Request Body")
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	var user models.User
	query := `SELECT username, dob, email, password FROM users WHERE email = $1`
	err = conn.QueryRow(query, req.Email).Scan(&user.Username, &user.Dob, &user.Email, &user.Password)
	if err != nil {
		http.Error(w, "Benutzer nicht gefunden oder Fehler beim Abruf", http.StatusUnauthorized)
		return
	}

	// Passwort vergleichen
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		http.Error(w, "Falsches Passwort", http.StatusUnauthorized)
		return
	}

	// JWT-Token erstellen
	tokenString, err := utils.CreateJWT(user.Email)
	if err != nil {
		http.Error(w, "Fehler beim Erstellen des Tokens", http.StatusInternalServerError)
		return
	}

	// Token zurückgeben
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login erfolgreich",
		"token":   tokenString,
	})
}
