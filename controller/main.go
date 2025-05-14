package main

import (
	"controller/handlers"
	"controller/utils"
	"log"
	"net/http"
	"os"
)

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
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
	r := http.NewServeMux()

	r.HandleFunc("/auth/", handlers.AuthHandler)

	r.HandleFunc("/bikemodels", handlers.GetBikeModels)
	r.HandleFunc("/bikes", handlers.BikeHandler)
	r.HandleFunc("/customers", handlers.CustomerHandler)
	r.HandleFunc("/dashboard/", handlers.DashBoardHandler)
	r.HandleFunc("/frames", handlers.GetFrames)
	r.HandleFunc("/forks", handlers.GetForks)
	r.HandleFunc("/orders", handlers.OrderHandler)
	r.HandleFunc("/partcosts", handlers.GetPartCosts)
	r.HandleFunc("/rolemanagements/", handlers.GetRoleManagementByID)
	r.HandleFunc("/rolemanagements", handlers.RoleManagementHandler)
	r.HandleFunc("/projects", handlers.ProjectHandler)
	r.HandleFunc("/saddles", handlers.GetSaddles)
	r.HandleFunc("/user", handlers.GetUser)
	r.HandleFunc("/users", handlers.GetUsers)
	r.HandleFunc("/warehouseparts", handlers.WarehousePartHandler)

	return r
}

func main() {
	allowedOrigins := utils.GetAllowedOrigins()
	handler := corsMiddleware(allowedOrigins, setupRoutes())

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server läuft auf Port", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
