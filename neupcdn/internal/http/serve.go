package http

import (
	"net/http"
)

func ServeHandler(w http.ResponseWriter, r *http.Request) {
	if _, _, _, ok := parseRootFileRoute(r.URL.Path); ok {
		FileServeHandler(w, r)
		return
	}

	ClientErrorCode(w, http.StatusNotFound, "404_not_found", "Route not found", nil)
}
