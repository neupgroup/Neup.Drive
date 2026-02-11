package http

import "net/http"

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// Legacy route (kept for reference, but client now uses main app for token generation)
	// mux.HandleFunc("/upload/prepare", PrepareUploadHandler)
	
	mux.HandleFunc("/upload", UploadHandler)
	
	// Serve static files (if needed, or disable if purely API)
	mux.HandleFunc("/", ServeHandler)

	return mux
}
