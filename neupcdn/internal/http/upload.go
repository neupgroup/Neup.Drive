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
	// 0. System Check: Public Key must be configured
	if config.Cfg.UploadPublicKey == "" {
		InternalServerError(w, "UploadPublicKey not configured in server", nil)
		return
	}

	// 1. Method Check & Size Check
	if r.Method != http.MethodPut {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use PUT for chunked uploads.", nil)
		return
	}

	if r.ContentLength > config.Cfg.MaxChunkSize {
		ClientErrorCode(w, http.StatusRequestEntityTooLarge, "chunk_too_large", fmt.Sprintf("Chunk size exceeds limit of %d bytes", config.Cfg.MaxChunkSize), nil)
		return
	}

	// 2. Security: Verify Token (Ed25519)
	tokenJSON := r.Header.Get("x-upload-token")
	if tokenJSON == "" {
		// "if mime type, filename, path, file category, etc is not found error: ... not found."
		TokenNotFound(w, "x-upload-token header not found", nil)
		return
	}

	claims, err := security.VerifyEd25519Token(tokenJSON, config.Cfg.UploadPublicKey)
	if err != nil {
		// Distinguish between configuration error and client error
		if err.Error() == "invalid public key configuration" {
			InternalServerError(w, "Invalid public key configuration during verification", err)
			return
		}
		TokenNotFound(w, "Invalid upload token", err)
		return
	}

	// 3. Verify Metadata in Token
	// "if mime type, filename, path, file category, etc is not found error: ... not found."

	if claims.AccountID == "" {
		TokenNotFound(w, "Account ID not found in upload token", nil)
		return
	}
	if claims.Path == "" {
		TokenNotFound(w, "Path not found in upload token", nil)
		return
	}
	if claims.ContentType == "" {
		TokenNotFound(w, "Content-Type not found in upload token", nil)
		return
	}
	if claims.Nonce == "" {
		TokenNotFound(w, "Nonce not found in upload token", nil)
		return
	}

	// 3.1 Verify Request Headers
	fileHash := r.Header.Get("x-file-hash")
	if fileHash == "" {
		ClientErrorCode(w, http.StatusBadRequest, "missing_file_hash", "x-file-hash header not found", nil)
		return
	}

	// 4. Handle Content-Range for Chunking
	contentRange := r.Header.Get("Content-Range")
	if contentRange == "" {
		ClientErrorCode(w, http.StatusBadRequest, "missing_content_range", "Content-Range header not found", nil)
		return
	}

	start, end, total, err := parseContentRange(contentRange)
	if err != nil {
		ClientErrorCode(w, http.StatusBadRequest, "invalid_content_range", "Invalid Content-Range header", err)
		return
	}

	if total > claims.MaxSize {
		ClientErrorCode(w, http.StatusForbidden, "file_size_exceeds_limit", "File size exceeds token limit", nil)
		return
	}

	// 5. Determine File Paths
	relPath := claims.Path
	finalPath := filepath.Join(config.Cfg.PublicRoot, relPath)
	tempPath := finalPath + ".part"

	// Ensure directory exists
	// "if something is just to be saved on the server, save that on log, and say internal server."
	if err := os.MkdirAll(filepath.Dir(finalPath), 0755); err != nil {
		InternalServerError(w, "Failed to create directory", err)
		return
	}

	// 6. Write Chunk
	flags := os.O_WRONLY | os.O_CREATE
	if start > 0 {
		flags = os.O_WRONLY // Open existing
	}

	f, err := os.OpenFile(tempPath, flags, 0644)
	if err != nil {
		InternalServerError(w, "Failed to open file for writing", err)
		return
	}
	defer f.Close()

	if _, err := f.Seek(start, 0); err != nil {
		InternalServerError(w, "Failed to seek file", err)
		return
	}

	written, err := io.Copy(f, r.Body)
	if err != nil {
		InternalServerError(w, "Failed to write chunk", err)
		return
	}

	_ = written // We can use this to verify if full chunk was written

	// 7. Check if Upload Complete
	if end+1 == total {
		f.Close()

		if err := os.Rename(tempPath, finalPath); err != nil {
			InternalServerError(w, "Failed to finalize file", err)
			return
		}

		// 8. Trigger Callback
		go triggerCallback(claims, fileHash, "verified")

		JSONResponse(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"path":    claims.Path,
			"status":  "completed",
		})
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
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
