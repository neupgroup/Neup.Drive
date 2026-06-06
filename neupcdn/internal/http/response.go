package http

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
)

type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   string      `json:"error"`
	Code    interface{} `json:"code,omitempty"` // Support both int (status) and string (random ID)
}

// GenerateRandomErrorID generates a random 8-character hex string
func GenerateRandomErrorID() string {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(bytes)
}

// InternalServerError logs the improved error with a random ID and returns a generic 500 response
func InternalServerError(w http.ResponseWriter, logMsg string, err error) {
	errorID := GenerateRandomErrorID()

	if UploadLogger != nil {
		UploadLogger.Printf("[%s] %s: %v", errorID, logMsg, err)
	} else {
		log.Printf("[INTERNAL ERROR] [%s] %s: %v", errorID, logMsg, err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   "Internal Server Error",
		Code:    errorID,
	})
}

// ClientError handles client-side errors (4xx)
func ClientError(w http.ResponseWriter, statusCode int, userMsg string, internalErr error) {
	ClientErrorCode(w, statusCode, userMsg, http.StatusText(statusCode), internalErr)
}

// ClientErrorCode handles client-side errors (4xx) using a stable machine-readable code.
func ClientErrorCode(w http.ResponseWriter, statusCode int, code string, internalMsg string, internalErr error) {
	if UploadLogger != nil && internalErr != nil {
		UploadLogger.Printf("[CLIENT ERROR] %s: %v", internalMsg, internalErr)
	} else if UploadLogger != nil {
		UploadLogger.Printf("[CLIENT ERROR] %s", internalMsg)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Success: false,
		Error:   code,
	})
}

// Deprecated: Use ClientError or InternalServerError instead
func JSONError(w http.ResponseWriter, statusCode int, message string) {
	ClientError(w, statusCode, message, nil)
}

func JSONResponse(w http.ResponseWriter, code int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
