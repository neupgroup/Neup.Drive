package http

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
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

	userAgent := r.UserAgent()
	record := map[string]interface{}{
		"timestamp":                   time.Now().UTC().Format(time.RFC3339),
		"event":                       event,
		"method":                      r.Method,
		"path":                        r.URL.Path,
		"query":                       r.URL.RawQuery,
		"host":                        r.Host,
		"remote_addr":                 r.RemoteAddr,
		"ip":                          requestDeviceIP(r),
		"user_agent":                  userAgent,
		"client_channel":              detectClientChannel(r, userAgent),
		"origin":                      r.Header.Get("Origin"),
		"referer":                     r.Referer(),
		"forwarded_for":               r.Header.Get("X-Forwarded-For"),
		"real_ip":                     r.Header.Get("X-Real-IP"),
		"cf_connecting_ip":            r.Header.Get("CF-Connecting-IP"),
		"sec_fetch_site":              r.Header.Get("Sec-Fetch-Site"),
		"sec_fetch_mode":              r.Header.Get("Sec-Fetch-Mode"),
		"sec_fetch_dest":              r.Header.Get("Sec-Fetch-Dest"),
		"accept":                      r.Header.Get("Accept"),
		"content_type":                r.Header.Get("Content-Type"),
		"content_length":              r.ContentLength,
		"has_upload_token":            r.Header.Get("x-upload-token") != "",
		"has_file_operation_token":    r.Header.Get("x-file-operation-token") != "",
		"has_query_token":             r.URL.Query().Get("token") != "",
		"has_authorization_header":    r.Header.Get("Authorization") != "",
		"has_x_requested_with_header": r.Header.Get("X-Requested-With") != "",
		"has_sec_fetch_site_header":   r.Header.Get("Sec-Fetch-Site") != "",
		"has_cf_connecting_ip_header": r.Header.Get("CF-Connecting-IP") != "",
		"has_x_forwarded_for_header":  r.Header.Get("X-Forwarded-For") != "",
		"has_x_file_hash_header":      r.Header.Get("x-file-hash") != "",
		"has_content_range_header":    r.Header.Get("Content-Range") != "",
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

func detectClientChannel(r *http.Request, userAgent string) string {
	ua := strings.ToLower(strings.TrimSpace(userAgent))
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	referer := strings.TrimSpace(r.Referer())
	secFetchSite := strings.TrimSpace(r.Header.Get("Sec-Fetch-Site"))

	if origin != "" || referer != "" || secFetchSite != "" {
		return "website"
	}

	switch {
	case ua == "":
		return "unknown"
	case strings.Contains(ua, "mozilla/"):
		return "browser"
	case strings.Contains(ua, "curl/"),
		strings.Contains(ua, "wget/"),
		strings.Contains(ua, "httpie/"),
		strings.Contains(ua, "powershell/"),
		strings.Contains(ua, "python-requests/"):
		return "terminal"
	case strings.Contains(ua, "postmanruntime/"),
		strings.Contains(ua, "insomnia/"),
		strings.Contains(ua, "go-http-client/"),
		strings.Contains(ua, "node"),
		strings.Contains(ua, "axios/"),
		strings.Contains(ua, "undici"):
		return "api_client"
	default:
		return "app"
	}
}
