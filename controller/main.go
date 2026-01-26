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
	dwh := http.NewServeMux()

	dwh.HandleFunc("/auth/", handlers.AuthHandler)
	dwh.HandleFunc("/dashboard/", handlers.DashBoardHandler)
	dwh.HandleFunc("/bikemodels", handlers.GetBikeModels)
	dwh.HandleFunc("/bikes", handlers.BikeHandler)
	dwh.HandleFunc("/components", handlers.ComponentHandler)
	dwh.HandleFunc("/customers", handlers.CustomerHandler)
	dwh.HandleFunc("/orders", handlers.OrderHandler)
	dwh.HandleFunc("/orderitems", handlers.OrderItemsHandler)
	dwh.HandleFunc("/partcosts", handlers.GetPartCosts)
	dwh.HandleFunc("/rolemanagements/", handlers.GetRoleManagementByID)
	dwh.HandleFunc("/rolemanagements", handlers.RoleManagementHandler)
	dwh.HandleFunc("/projects", handlers.ProjectHandler)
	dwh.HandleFunc("/user", handlers.GetUser)
	dwh.HandleFunc("/users", handlers.GetUsers)
	dwh.HandleFunc("/warehouseparts", handlers.WarehousePartHandler)

	mainRouter := http.NewServeMux()
	mainRouter.Handle("/dwh/", http.StripPrefix("/dwh", dwh))

	return mainRouter
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
