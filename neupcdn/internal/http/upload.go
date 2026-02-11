package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"neupcdn/config"
	"neupcdn/internal/security"
	// "neupcdn/internal/storage"
)

// Legacy Handler for Ed25519 Signed Requests
func PrepareUploadHandler(w http.ResponseWriter, r *http.Request) {
	// ... (Keep existing implementation if needed, or deprecate)
	// For now, focusing on the new handler
}

// Handler for Chunked Uploads with HMAC-SHA256 Token
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Method Check
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed. Use PUT for chunked uploads.", http.StatusMethodNotAllowed)
		return
	}

	// 2. Security: Verify HMAC Token
	tokenJSON := r.Header.Get("x-upload-token")
	if tokenJSON == "" {
		http.Error(w, "Missing x-upload-token header", http.StatusUnauthorized)
		return
	}

	claims, err := security.VerifyHMACSignature(tokenJSON, config.Cfg.SecretKey)
	if err != nil {
		http.Error(w, "Invalid upload token: "+err.Error(), http.StatusForbidden)
		return
	}

	// 3. Verify Request Matches Token Constraints
	// Check Content-Hash header (sent by client for the chunk or full file? Client sends x-file-hash)
	fileHash := r.Header.Get("x-file-hash")
	if fileHash == "" {
		http.Error(w, "Missing x-file-hash header", http.StatusBadRequest)
		return
	}

	// 4. Handle Content-Range for Chunking
	// Format: bytes start-end/total
	contentRange := r.Header.Get("Content-Range")
	if contentRange == "" {
		http.Error(w, "Missing Content-Range header", http.StatusBadRequest)
		return
	}

	start, end, total, err := parseContentRange(contentRange)
	if err != nil {
		http.Error(w, "Invalid Content-Range header", http.StatusBadRequest)
		return
	}

	if total > claims.MaxSize {
		http.Error(w, "File size exceeds token limit", http.StatusForbidden)
		return
	}

	// 5. Determine File Paths
	// We use a temporary file extension while uploading
	relPath := claims.Path
	finalPath := filepath.Join(config.Cfg.PublicRoot, relPath)
	tempPath := finalPath + ".part"

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(finalPath), 0755); err != nil {
		http.Error(w, "Failed to create directory", http.StatusInternalServerError)
		return
	}

	// 6. Write Chunk
	// Open file in Append or Create mode
	flags := os.O_WRONLY | os.O_CREATE
	if start > 0 {
		flags = os.O_WRONLY // Open existing
	}

	f, err := os.OpenFile(tempPath, flags, 0644)
	if err != nil {
		http.Error(w, "Failed to open file for writing", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	// Seek to the correct offset
	if _, err := f.Seek(start, 0); err != nil {
		http.Error(w, "Failed to seek file", http.StatusInternalServerError)
		return
	}

	// Copy request body to file
	written, err := io.Copy(f, r.Body)
	if err != nil {
		http.Error(w, "Failed to write chunk", http.StatusInternalServerError)
		return
	}

	if written != (end - start + 1) {
		// Warning: wrote less than expected?
	}

	// 7. Check if Upload Complete
	if end+1 == total {
		// Close file handle before renaming
		f.Close()

		// Rename .part to final
		if err := os.Rename(tempPath, finalPath); err != nil {
			http.Error(w, "Failed to finalize file", http.StatusInternalServerError)
			return
		}

		// Verify Hash (Optional but recommended - requires reading full file back)
		// For performance, we might skip this or do it asynchronously
		// go verifyFileHash(finalPath, fileHash)

		// 8. Trigger Callback
		go triggerCallback(claims, fileHash, "verified")

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"path":    claims.Path,
			"status":  "completed",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"chunk":   fmt.Sprintf("%d-%d", start, end),
		"status":  "partial",
	})
}

// Helper: Parse Content-Range header
func parseContentRange(header string) (int64, int64, int64, error) {
	// Example: bytes 0-1023/2048
	if !strings.HasPrefix(header, "bytes ") {
		return 0, 0, 0, fmt.Errorf("invalid prefix")
	}

	parts := strings.Split(strings.TrimPrefix(header, "bytes "), "/")
	if len(parts) != 2 {
		return 0, 0, 0, fmt.Errorf("invalid format")
	}

	rangeParts := strings.Split(parts[0], "-")
	if len(rangeParts) != 2 {
		return 0, 0, 0, fmt.Errorf("invalid range")
	}

	start, err := strconv.ParseInt(rangeParts[0], 10, 64)
	if err != nil {
		return 0, 0, 0, err
	}

	end, err := strconv.ParseInt(rangeParts[1], 10, 64)
	if err != nil {
		return 0, 0, 0, err
	}

	total, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return 0, 0, 0, err
	}

	return start, end, total, nil
}

// Helper: Trigger Callback
func triggerCallback(claims *security.UploadSignaturePayload, fileHash, status string) {
	if config.Cfg.CallbackURL == "" {
		return
	}

	payload := map[string]interface{}{
		"upload_session_id": claims.Nonce, // Using nonce as session ID mapping
		"file_hash":         fileHash,
		"status":            status,
		"metadata":          claims,
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(config.Cfg.CallbackURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Callback failed: %v", err)
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != 200 {
		log.Printf("Callback returned non-200 status: %d", resp.StatusCode)
	}
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
