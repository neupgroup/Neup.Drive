package http

import "net/http"

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (recorder *statusRecorder) WriteHeader(statusCode int) {
	recorder.statusCode = statusCode
	recorder.ResponseWriter.WriteHeader(statusCode)
}

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

func auditRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		recorder := &statusRecorder{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(recorder, r)

		if r.Method == http.MethodOptions {
			return
		}

		LogActivity("url_visit", r, map[string]interface{}{
			"status_code": recorder.statusCode,
		})
	})
}

func SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/upload", UploadHandler)
	mux.HandleFunc("/list", FileListHandler)
	mux.HandleFunc("/operate/", FileOperationDispatchHandler)
	mux.HandleFunc("/serve/", FileServeHandler)
	mux.HandleFunc("/", ServeHandler)

	// Return the mux wrapped with CORS middleware
	return enableCORS(auditRequests(mux))
}
