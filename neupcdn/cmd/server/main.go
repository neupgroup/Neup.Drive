package main

import (
	"log"
	"net/http"

	"neupcdn/config"
	internalHttp "neupcdn/internal/http"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env automatically (dev only)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading environment variables")
	}

	// Load config
	config.Load()

	internalHttp.InitLoggers()

	mux := internalHttp.SetupRoutes()
	log.Printf("Neup.CDN is running at http://localhost:%s", config.Cfg.Port)
	log.Fatal(http.ListenAndServe(":"+config.Cfg.Port, mux))
}
