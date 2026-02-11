package http

import (
	"log"
	"os"
)

var (
	UploadLogger   *log.Logger
	DownloadLogger *log.Logger
)

func InitLoggers() {
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
