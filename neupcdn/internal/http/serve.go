package http

import (
	"net/http"
)

func ServeHandler(w http.ResponseWriter, r *http.Request) {
	ClientErrorCode(w, http.StatusNotFound, "404_not_found", "Route not found", nil)
}
