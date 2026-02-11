package main

import (
	"log"
	"net/http"
	
	"github.com/joho/godotenv"
	"neupcdn/config"
	internalHttp "neupcdn/internal/http"
	"neupcdn/internal/sftp"
)

func main() {
	// Load .env automatically (dev only)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading environment variables")
	}

	// Load config
	config.Load()

	// Start Virtual SFTP Server
	go sftp.StartServer()

	// SetupRoutes now returns http.Handler (with CORS)
	handler := internalHttp.SetupRoutes()
	log.Println("Starting Neup.CDN on port " + config.Cfg.Port)
	log.Fatal(http.ListenAndServe(":"+config.Cfg.Port, handler))
}
