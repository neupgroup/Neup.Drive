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
		LogDownloadError("Invalid path traversal attempt", nil)
		JSONError(w, http.StatusNotFound, "File not found")
		return
	}

	fullPath := filepath.Join(config.Cfg.PublicRoot, clean)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		LogDownloadError("File not found: "+fullPath, err)
		JSONError(w, http.StatusNotFound, "File not found")
		return
	}

	http.ServeFile(w, r, fullPath)
}
