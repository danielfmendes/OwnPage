package handlers

import (
	"controller/models"
	"controller/utils"
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"time"
)

func AuthHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch path {
	case "/auth/register":
		HandleRegister(w, r)
	case "/auth/login":
		HandleLogin(w, r)
	case "/auth/verify":
		HandleEmailVerification(w, r)
	default:
		http.Error(w, "Not Found", http.StatusNotFound)
	}
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	utils.HandleGet(w, r, "SELECT * FROM users", func(scanner utils.Scanner) (any, error) {
		var user models.User
		err := scanner.Scan(&user.Username, &user.Dob, &user.Email, &user.Password)
		return user, err
	})
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	email, found := utils.ExtractFilterValue(r, "email")
	if !found {
		http.Error(w, utils.ErrMsgEmailMissing, http.StatusBadRequest)
		return
	}

	// SQL-Abfrage zum Abrufen des Benutzers basierend auf der E-Mail-Adresse
	query := `SELECT username, dob, email FROM users WHERE email = $1`

	// Die HandleGet-Funktion wird verwendet, um die Abfrage auszuführen und den Benutzer abzurufen
	utils.HandleGet(w, r, query, func(scanner utils.Scanner) (any, error) {
		var user models.User
		err := scanner.Scan(&user.Username, &user.Dob, &user.Email)
		return user, err
	}, email)
}

func HandleEmailVerification(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, utils.ErrMsgTokenMissing, http.StatusBadRequest)
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	var email string
	var expires time.Time
	query := `SELECT email, verification_expires FROM users WHERE verification_token = $1`
	err = conn.QueryRow(query, token).Scan(&email, &expires)
	if err != nil {
		http.Error(w, utils.ErrMsgTokenExpiredOrInvalid, http.StatusBadRequest)
		return
	}

	if time.Now().After(expires) {
		http.Error(w, utils.ErrMsgTokenExpired, http.StatusBadRequest)
		return
	}

	_, err = conn.Exec(`UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE email = $1`, email)
	if err != nil {
		http.Error(w, "Error during verification.", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Email successfully confirmed! You can now log in."))
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.HandleError(w, err, utils.ErrMsgInvalidRequestBody)
		return
	}

	// Geburtsdatum parsen
	dob, err := time.Parse("2006-01-02", user.Dob.Format("2006-01-02"))
	if err != nil {
		utils.HandleError(w, err, utils.ErrMsgDobInvalid)
		return
	}

	// Passwort hashen
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.HandleError(w, err, "Error when hashing the password.")
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	verificationToken := utils.GenerateVerificationToken()
	verificationExpires := time.Now().Add(7 * 24 * time.Hour)
	query := `INSERT INTO users (username, email, password, dob, is_verified, verification_expires, verification_token)
          VALUES ($1, $2, $3, $4, FALSE, $5, $6)`
	_, err = conn.Exec(query, user.Username, user.Email, string(hashedPassword), dob, verificationExpires, verificationToken)
	if err != nil {
		utils.HandleError(w, err, utils.ErrMsgInsertRecordFailed)
		return
	}

	// E-Mail zur Bestätigung senden
	if os.Getenv("DISABLE_EMAILS") != "true" {
		SendVerificationEmail(user.Email, verificationToken)
	}

	// JWT-Token erstellen
	tokenString, err := utils.CreateJWT(user.Email)
	if err != nil {
		http.Error(w, utils.ErrMsgCreateToken, http.StatusInternalServerError)
		return
	}

	// Antwort mit Token zurückgeben
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Registration successful",
		"token":   tokenString,
	})
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, utils.ErrMsgPostOnly, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.HandleError(w, err, utils.ErrMsgInvalidRequestBody)
		return
	}

	conn, err := utils.ConnectToDB(w)
	if err != nil {
		return
	}
	defer conn.Close()

	var user models.User
	query := `SELECT username, dob, email, password, is_verified, verification_expires FROM users WHERE email = $1`
	err = conn.QueryRow(query, req.Email).Scan(&user.Username, &user.Dob, &user.Email, &user.Password, &user.IsVerified, &user.VerificationExpires)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if !user.IsVerified {
		if user.VerificationExpires == nil {
			http.Error(w, "Verification required", http.StatusForbidden)
			return
		}

		if time.Now().After(*user.VerificationExpires) {
			http.Error(w, "Verification time expired", http.StatusForbidden)
			return
		}

		http.Error(w, "Please confirm your e-mail address", http.StatusForbidden)
		return
	}

	// Passwort vergleichen
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}

	// JWT-Token erstellen
	tokenString, err := utils.CreateJWT(user.Email)
	if err != nil {
		http.Error(w, utils.ErrMsgCreateToken, http.StatusInternalServerError)
		return
	}

	// Token zurückgeben
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Login successful",
		"token":   tokenString,
	})
}

func SendVerificationEmail(to string, token string) {
	from, pass := utils.GetEmailCredentials()

	subject := "Please confirm your e-mail address for NebulaDW"
	baseURL := utils.GetBackendBaseURL()
	msg := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n"
	msg += fmt.Sprintf("From: %s\nTo: %s\nSubject: %s\n\n", from, to, subject)
	msg += fmt.Sprintf("<html><body><p>Click <a href=\"%s/auth/verify?token=%s\">hier</a>, to verify your account.</p></body></html>", baseURL, token)

	err := smtp.SendMail("smtp.gmail.com:587", smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))
	if err != nil {
		log.Println("Error sending the e-mail:", err)
	}
}
