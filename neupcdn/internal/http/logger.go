package http

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

var (
	UploadLogger   *log.Logger
	DownloadLogger *log.Logger
	ActivityLogger *log.Logger
)

func InitLoggers() {
	if err := os.MkdirAll("logs", 0755); err != nil {
		log.Fatalf("Failed to create logs directory: %v", err)
	}

	// Open upload error log file
	uFile, err := os.OpenFile("upload.error.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open upload.error.log: %v", err)
	}
	UploadLogger = log.New(uFile, "UPLOAD_ERROR: ", log.LstdFlags|log.Lshortfile)

	// Open download error log file
	dFile, err := os.OpenFile("download.error.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open download.error.log: %v", err)
	}
	DownloadLogger = log.New(dFile, "DOWNLOAD_ERROR: ", log.LstdFlags|log.Lshortfile)

	aFile, err := os.OpenFile("logs/activity.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open logs/activity.log: %v", err)
	}
	ActivityLogger = log.New(aFile, "", 0)
}

func LogUploadError(msg string, err error) {
	if UploadLogger != nil {
		if err != nil {
			UploadLogger.Printf("%s: %v", msg, err)
		} else {
			UploadLogger.Println(msg)
		}
	}
}

func LogDownloadError(msg string, err error) {
	if DownloadLogger != nil {
		if err != nil {
			DownloadLogger.Printf("%s: %v", msg, err)
		} else {
			DownloadLogger.Println(msg)
		}
	}
}

func LogActivity(event string, r *http.Request, details map[string]interface{}) {
	if ActivityLogger == nil || r == nil {
		return
	}

	record := map[string]interface{}{
		"timestamp":  time.Now().UTC().Format(time.RFC3339),
		"event":      event,
		"method":     r.Method,
		"path":       r.URL.Path,
		"query":      r.URL.RawQuery,
		"ip":         requestDeviceIP(r),
		"user_agent": r.UserAgent(),
	}

	for key, value := range details {
		record[key] = value
	}

	encoded, err := json.Marshal(record)
	if err != nil {
		LogUploadError("failed to encode activity log", err)
		return
	}

	ActivityLogger.Println(string(encoded))
}
