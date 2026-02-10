package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port              string
	PublicRoot        string
	AccountPublicKeys map[string]string // account -> hex_public_key
	MaxUploadSize     int64
	SFTPHost          string
	SFTPPort          string
	SFTPUser          string
	SFTPPass          string
	SFTPHostKeyPath   string
}

var Cfg Config

func Load() {
	Cfg = Config{
		Port:              getEnv("PORT", "3000"),
		PublicRoot:        getEnv("PUBLIC_ROOT", "/home/ubuntu/public"),
		AccountPublicKeys: make(map[string]string),
		MaxUploadSize:     getEnvInt64("MAX_UPLOAD_SIZE", 5<<20),
		SFTPHost:          getEnv("SFTP_HOST", "localhost"),
		SFTPPort:          getEnv("SFTP_PORT", "22"),
		SFTPUser:          getEnv("SFTP_USER", "root"),
		SFTPPass:          getEnv("SFTP_PASS", ""),
		SFTPHostKeyPath:   getEnv("SFTP_HOST_KEY_PATH", "host_key"),
	}

	// Load account public keys from environment
	// Format: PUBLIC_KEY_{ACCOUNT}=hex_ed25519_key
	for _, env := range os.Environ() {
		if len(env) > 11 && env[:11] == "PUBLIC_KEY_" {
			parts := strings.Split(env, "=")
			if len(parts) == 2 {
				keyName := parts[0][11:]
				Cfg.AccountPublicKeys[keyName] = parts[1]
			}
		}
	}

	log.Printf("Config loaded with %d keys", len(Cfg.AccountPublicKeys))
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

