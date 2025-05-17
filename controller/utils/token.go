package utils

import (
	"controller/secrets"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"net/http"
	"time"
)

func CreateJWT(useremail string) (string, error) {
	expirationTime := time.Now().Add(30 * time.Minute) // Ablaufzeit auf 30 Minuten setzen
	claims := &jwt.StandardClaims{
		ExpiresAt: expirationTime.Unix(),
		Issuer:    "NebulaDW",
		Subject:   useremail,
	}

	// JWT erstellen
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(secrets.JwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateToken(w http.ResponseWriter, r *http.Request) (string, error) {
	tokenString := r.Header.Get("Authorization")
	if tokenString == "" {
		http.Error(w, ErrMsgTokenMissing, http.StatusUnauthorized)
		return "", fmt.Errorf(ErrMsgTokenMissing)
	}

	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	} else {
		http.Error(w, ErrMsgInvalidTokenFormat, http.StatusUnauthorized)
		return "", fmt.Errorf(ErrMsgInvalidTokenFormat)
	}

	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return secrets.JwtSecret, nil
	})
	if err != nil {
		http.Error(w, ErrMsgInvalidToken, http.StatusUnauthorized)
		return "", err
	}

	claims, ok := token.Claims.(*jwt.StandardClaims)
	if !ok || claims.ExpiresAt < time.Now().Unix() {
		http.Error(w, ErrMsgTokenExpiredOrInvalid, http.StatusUnauthorized)
		return "", fmt.Errorf(ErrMsgTokenExpiredOrInvalid)
	}

	if claims.Issuer != "NebulaDW" {
		http.Error(w, ErrMsgInvalidIssuer, http.StatusUnauthorized)
		return "", fmt.Errorf(ErrMsgInvalidIssuer)
	}

	// E-Mail aus dem Subject zurückgeben
	return claims.Subject, nil
}
