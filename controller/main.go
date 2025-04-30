package main

import (
	"controller/handlers"
	"log"
	"net/http"
	"os"
)

// getAllowedOrigins bestimmt die erlaubten CORS-Ursprünge basierend auf der Umgebung
func getAllowedOrigins() []string {
	connStr := os.Getenv("DATABASE_PUBLIC_URL")
	if connStr == "" {
		return []string{"http://localhost:5173"}
	}
	return []string{"https://www.danielfreiremendes.com"}
}

// corsMiddleware erzeugt den CORS-Handler
func corsMiddleware(allowedOrigins []string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := false

		for _, o := range allowedOrigins {
			if origin == o {
				allowed = true
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				break
			}
		}

		if !allowed && origin != "" {
			log.Printf("Verbindung von nicht erlaubtem Origin blockiert: %s", origin)
		}

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		h.ServeHTTP(w, r)
	})
}

// setupRoutes registriert alle HTTP-Routen
func setupRoutes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/bikes", handlers.GetBikes)
	return mux
}

func main() {
	allowedOrigins := getAllowedOrigins()
	handler := corsMiddleware(allowedOrigins, setupRoutes())

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server läuft auf Port", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
