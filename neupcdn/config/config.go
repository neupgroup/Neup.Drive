package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	Port            string
	PublicRoot      string
	UploadPublicKey string // Ed25519 Public Key
	CallbackURL     string // URL to notify on upload completion
	MaxUploadSize   int64  // Default 1000MB
}

var Cfg Config

func Load() {
	Cfg = Config{
		PublicRoot:      "./public",
		UploadPublicKey: getEnv("UPLOAD_SECRET_PUBLIC_KEY", ""),
		CallbackURL:     "https://neupgroup.com/drive/callback/v1/upload",
		MaxUploadSize:   10000, // Default 1000MB
	}

	log.Printf("Config loaded. PublicRoot: %s, MaxSize: %d", Cfg.PublicRoot, Cfg.MaxUploadSize)

	// Log public key status
	if Cfg.UploadPublicKey != "" {
		log.Printf("✅ UPLOAD_SECRET_PUBLIC_KEY loaded (length: %d chars)", len(Cfg.UploadPublicKey))
		log.Printf("   Public Key: %s...", Cfg.UploadPublicKey[:4]) // Show first 4 chars
	} else {
		log.Printf("⚠️  WARNING: UPLOAD_SECRET_PUBLIC_KEY is NOT set! Uploads will fail!")
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt64(key string, def int64) int64 {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.ParseInt(v, 10, 64); err == nil {
			return i
		}
	}
	return def
}
