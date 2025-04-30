package main

import (
	"flag"
	"go-bike-api/db"
	"go-bike-api/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	local := flag.Bool("local", false, "run in local development mode")
	flag.Parse()

	db.Connect()
	r := gin.Default()

	var allowedOrigins []string
	if *local {
		allowedOrigins = []string{"http://localhost:5173"}
	} else {
		allowedOrigins = []string{"https://danielfreiremendes.com"}
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/bikes", handlers.GetBikes)
	r.Run(":8080")
}
