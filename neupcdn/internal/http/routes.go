package http

import "net/http"

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/upload/prepare", PrepareUploadHandler)
	mux.HandleFunc("/upload", UploadHandler)
	mux.HandleFunc("/", ServeHandler)

	return mux
}
