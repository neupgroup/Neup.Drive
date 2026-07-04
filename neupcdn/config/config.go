package config

import (
	"log"
	"os"
	"strconv"
)

type Config struct {
	Port            string
	PublicRoot      string
	DriveRoot       string
	UploadPublicKey string // Ed25519 Public Key
	CallbackURL     string // URL to notify on upload completion
	MaxUploadSize   int64  // Total Limit (e.g. 10GB)
	MaxChunkSize    int64  // Single Request Limit (e.g. 50MB)
}

var Cfg Config

/*
::neup.documentation::cdn-config
::function Load()
::title CDN Config Loader
::owner Neup Drive

::public

Loads the CDN filesystem and signing configuration from environment variables.

::param environment PUBLIC_ROOT

The root directory used for public asset, signed, trash, and log storage.

::param environment DRIVE_ROOT

The dedicated root directory used for randomized Drive file storage.

::private

Drive files are stored outside `PUBLIC_ROOT` so the Drive folder tree can stay
database-backed while bytes live under `../drive_data/...`.

::private end

::end
*/
func Load() {
	Cfg = Config{
		Port:            getEnv("PORT", "3001"),
		PublicRoot:      getEnv("PUBLIC_ROOT", "../cdn_data"),
		DriveRoot:       getEnv("DRIVE_ROOT", "../drive_data"),
		UploadPublicKey: getEnv("UPLOAD_SECRET_PUBLIC_KEY", ""),
		CallbackURL:     "https://neupgroup.com/drive/bridge/callback.v1/upload",
		MaxUploadSize:   getEnvInt64("UPLOAD_MAX_SIZE", 10000*1024*1024),    // 10GB default
		MaxChunkSize:    getEnvInt64("UPLOAD_MAX_CHUNK_SIZE", 50*1024*1024), // 50MB default
	}

	log.Printf("Config loaded. Port: %s, PublicRoot: %s, DriveRoot: %s, MaxSize: %d bytes, MaxChunk: %d bytes", Cfg.Port, Cfg.PublicRoot, Cfg.DriveRoot, Cfg.MaxUploadSize, Cfg.MaxChunkSize)

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
