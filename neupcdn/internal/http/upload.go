package http

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"neupcdn/config"
	"neupcdn/internal/security"
	"neupcdn/internal/storage"
)

func PrepareUploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed. Use POST.", http.StatusMethodNotAllowed)
		return
	}

	accountID := r.FormValue("account")
	if accountID == "" {
		http.Error(w, "account is required", http.StatusBadRequest)
		return
	}

	// 1. Load Account Public Key
	pubKeyHex, ok := config.Cfg.AccountPublicKeys[accountID]
	if !ok {
		http.Error(w, "Unauthorized: Unknown account key", http.StatusUnauthorized)
		return
	}
	pubKeyBytes, err := hex.DecodeString(pubKeyHex)
	if err != nil || len(pubKeyBytes) != ed25519.PublicKeySize {
		http.Error(w, "Invalid server configuration for account key", http.StatusInternalServerError)
		return
	}
	pubKey := ed25519.PublicKey(pubKeyBytes)

	// 2. Get Headers
	timestamp := r.Header.Get("X-Time")
	contentHash := r.Header.Get("X-Hash")
	signature := r.Header.Get("X-Signature")

	if timestamp == "" || contentHash == "" || signature == "" {
		http.Error(w, "Missing security headers", http.StatusBadRequest)
		return
	}

	// 3. Verify Signature
	if err := security.VerifyRequest(pubKey, http.MethodPost, "/upload", timestamp, contentHash, signature); err != nil {
		http.Error(w, "Security verification failed: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// 4. Collect Metadata
	category := r.FormValue("category")
	targetPath := r.FormValue("path")

	if category == "" {
		http.Error(w, "category is required", http.StatusBadRequest)
		return
	}

	// Validate Category
	switch category {
	case "assets", "brand", "private", "signed":
		// Allowed
	default:
		http.Error(w, "Invalid category", http.StatusBadRequest)
		return
	}

	// 5. Generate Session Token
	sessionToken := security.CalculateHash([]byte(signature + timestamp))[:16]

	storage.RegisterPending(&storage.PendingUpload{
		Token:       sessionToken,
		AccountID:   sanitizeName(accountID),
		Category:    category,
		Path:        sanitizePath(targetPath),
		ContentHash: contentHash,
		ExpiresAt:   time.Now().Add(10 * time.Minute),
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"token":   sessionToken,
		"message": "Use this token as your SFTP password. Session expires in 10 minutes.",
	})
}

func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed. Use POST.", http.StatusMethodNotAllowed)
		return
	}

	// Single-step HTTP upload logic
	accountID := r.FormValue("account")
	if accountID == "" {
		http.Error(w, "account is required", http.StatusBadRequest)
		return
	}

	pubKeyHex, ok := config.Cfg.AccountPublicKeys[accountID]
	if !ok {
		http.Error(w, "Unauthorized: Unknown account key", http.StatusUnauthorized)
		return
	}
	pubKeyBytes, _ := hex.DecodeString(pubKeyHex)
	pubKey := ed25519.PublicKey(pubKeyBytes)

	timestamp := r.Header.Get("X-Time")
	contentHash := r.Header.Get("X-Hash")
	signature := r.Header.Get("X-Signature")

	if err := security.VerifyRequest(pubKey, http.MethodPost, "/upload", timestamp, contentHash, signature); err != nil {
		http.Error(w, "Verification failed", http.StatusUnauthorized)
		return
	}

	if err := r.ParseMultipartForm(config.Cfg.MaxUploadSize); err != nil {
		http.Error(w, "Form parse failed", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file field required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	category := r.FormValue("category")
	targetPath := r.FormValue("path")
	if targetPath == "" {
		targetPath = header.Filename
	}

	relPath := filepath.Join(sanitizeName(accountID), sanitizeName(category), sanitizePath(targetPath))
	finalPath := filepath.Join(config.Cfg.PublicRoot, relPath)

	if !strings.HasPrefix(finalPath, config.Cfg.PublicRoot) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	hasher := sha256.New()
	reader := io.TeeReader(file, hasher)

	if err := storage.AtomicWrite(finalPath, reader); err != nil {
		http.Error(w, "Upload failed", http.StatusInternalServerError)
		return
	}

	actualHash := hex.EncodeToString(hasher.Sum(nil))
	if actualHash != contentHash {
		_ = os.Remove(finalPath)
		http.Error(w, "Integrity mismatch", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"path":    "neupcdn.com/" + filepath.ToSlash(relPath),
	})
}

func sanitizeName(s string) string {
	s = strings.ToLower(s)
	reg := regexp.MustCompile(`[^a-z0-9_\-]`)
	return reg.ReplaceAllString(s, "-")
}

func sanitizePath(s string) string {
	s = strings.TrimPrefix(s, "/")
	s = strings.ToLower(s)
	reg := regexp.MustCompile(`[^a-z0-9_\-\./]`)
	return reg.ReplaceAllString(s, "-")
}
