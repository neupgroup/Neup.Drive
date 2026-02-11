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
	MaxUploadSize   int64
}

var Cfg Config

func Load() {
	Cfg = Config{
		Port:            getEnv("PORT", "3000"),
		PublicRoot:      getEnv("PUBLIC_ROOT", "/home/ubuntu/public"),
		UploadPublicKey: getEnv("UPLOAD_SECRET_PUBLIC_KEY", ""),
		CallbackURL:     getEnv("CALLBACK_URL", "https://neupgroup.com/drive/api/upload/callback"),
		MaxUploadSize:   getEnvInt64("MAX_UPLOAD_SIZE", 100<<20), // Default 100MB
	}

	log.Printf("Config loaded. PublicRoot: %s, MaxSize: %d", Cfg.PublicRoot, Cfg.MaxUploadSize)
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
