package config

import (
	"log"
	"os"
	"strconv"
    "golang.org/x/crypto/ssh"
)

type Config struct {
	Port              string
	PublicRoot        string
	SecretKey         string // For HMAC-SHA256
	CallbackURL       string // URL to notify on upload completion
	MaxUploadSize     int64
	SFTPHost          string
	SFTPPort          string
	SFTPUser          string
	SFTPPass          string
	SFTPHostKeyPath   string
    AccountPublicKeys map[string]ssh.PublicKey
}

var Cfg Config

func Load() {
	Cfg = Config{
		Port:              getEnv("PORT", "3000"),
		PublicRoot:        getEnv("PUBLIC_ROOT", "/home/ubuntu/public"),
		SecretKey:         getEnv("UPLOAD_SECRET_KEY", "your-secret-key-here"),
		CallbackURL:       getEnv("CALLBACK_URL", "https://neupgroup.com/drive/api/upload/callback"),
		MaxUploadSize:     getEnvInt64("MAX_UPLOAD_SIZE", 100<<20), // Default 100MB
		SFTPHost:          getEnv("SFTP_HOST", "localhost"),
		SFTPPort:          getEnv("SFTP_PORT", "22"),
		SFTPUser:          getEnv("SFTP_USER", "root"),
		SFTPPass:          getEnv("SFTP_PASS", ""),
		SFTPHostKeyPath:   getEnv("SFTP_HOST_KEY_PATH", "host_key"),
        AccountPublicKeys: make(map[string]ssh.PublicKey),
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
