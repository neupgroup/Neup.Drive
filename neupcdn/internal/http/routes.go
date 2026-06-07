package http

import "net/http"

// enableCORS wraps a handler to add CORS headers
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow any origin for now (restrict in production)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Range, Authorization, x-upload-session-id, x-file-hash, x-upload-token, x-file-operation-token, x-chunk-index")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Range")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Legacy route (kept for reference, but client now uses main app for token generation)
	// mux.HandleFunc("/upload/prepare", PrepareUploadHandler)

	mux.HandleFunc("/upload", UploadHandler)
	mux.HandleFunc("/api/files/operation", FileOperationHandler)
	mux.HandleFunc("/api/files/view", FileViewHandler)

	// Serve static files (if needed, or disable if purely API)
	mux.HandleFunc("/", ServeHandler)

	// Return the mux wrapped with CORS middleware
	return enableCORS(mux)
}
