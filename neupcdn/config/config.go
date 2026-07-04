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
	MaxUploadSize   int64  // Total Limit (e.g. 10GB)
	MaxChunkSize    int64  // Single Request Limit (e.g. 50MB)
}

var Cfg Config

func Load() {
	Cfg = Config{
		Port:            getEnv("PORT", "3001"),
		PublicRoot:      getEnv("PUBLIC_ROOT", "../cdn_data"),
		UploadPublicKey: getEnv("UPLOAD_SECRET_PUBLIC_KEY", ""),
		CallbackURL:     "https://neupgroup.com/drive/callback/v1/upload",
		MaxUploadSize:   getEnvInt64("UPLOAD_MAX_SIZE", 10000*1024*1024),    // 10GB default
		MaxChunkSize:    getEnvInt64("UPLOAD_MAX_CHUNK_SIZE", 50*1024*1024), // 50MB default
	}

	log.Printf("Config loaded. Port: %s, PublicRoot: %s, MaxSize: %d bytes, MaxChunk: %d bytes", Cfg.Port, Cfg.PublicRoot, Cfg.MaxUploadSize, Cfg.MaxChunkSize)

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
