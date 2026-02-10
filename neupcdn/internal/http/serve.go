package http

import (
	"net/http"
	"path/filepath"
	"strings"
	"neupcdn/config"
)

func ServeHandler(w http.ResponseWriter, r *http.Request) {
	clean := filepath.Clean(r.URL.Path)
	if strings.Contains(clean, "..") {
		http.NotFound(w, r)
		return
	}

	fullPath := filepath.Join(config.Cfg.PublicRoot, clean)
	http.ServeFile(w, r, fullPath)
}
