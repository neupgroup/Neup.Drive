package http

import (
	"net/http"
	"neupcdn/config"
	"os"
	"path/filepath"
	"strings"
)

func ServeHandler(w http.ResponseWriter, r *http.Request) {
	clean := filepath.Clean(r.URL.Path)
	if strings.Contains(clean, "..") {
		// "if something like client tries to manipulate the system like using expired keys, log that and also show an error."
		// Path traversal is a manipulation attempt.
		ClientError(w, http.StatusForbidden, "Invalid path traversal attempt", nil)
		return
	}

	fullPath := filepath.Join(config.Cfg.PublicRoot, clean)

	// Check if file exists
	if _, err := os.Stat(fullPath); err != nil {
		if os.IsNotExist(err) {
			// "if mime type, filename, path, file category, etc is not found error: ... not found."
			ClientError(w, http.StatusNotFound, "File not found", err)
			return
		}
		// "if something is just to be saved on the server, save that on log, and say internal server."
		InternalServerError(w, "Failed to access file", err)
		return
	}

	http.ServeFile(w, r, fullPath)
}
