package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"neupcdn/config"
	"neupcdn/internal/http"
)

func main() {
	// Load .env automatically (dev only)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading environment variables")
	}

	// Load config
	config.Load()

	mux := http.SetupRoutes()
	log.Println("Starting Neup.CDN on port " + config.Cfg.Port)
	log.Fatal(http.ListenAndServe(":"+config.Cfg.Port, mux))
}
