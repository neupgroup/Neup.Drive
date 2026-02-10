package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"
	"neupcdn/internal/security"
)

type UploadResponse struct {
	Success bool   `json:"success"`
	Path    string `json:"path"`
}

func main() {
	// Try to load .env
	_ = godotenv.Load()

	filePath := flag.String("file", "", "Path to the file to upload")
	targetPath := flag.String("path", "", "Target path on server")
	accountID := flag.String("account", "default", "Account ID")
	category := flag.String("category", "general", "Category (assets, brand, private, etc.)")
	host := flag.String("host", "http://localhost:3000", "Server host")
	flag.Parse()

	if *filePath == "" || *accountID == "" || *category == "" {
		fmt.Println("Usage: go run cmd/uploader/main.go -file <path> -account <id> -category <cat> ...")
		return
	}

	key := os.Getenv("UPLOAD_SIGNING_KEY")
	if key == "" {
		fmt.Println("Error: UPLOAD_SIGNING_KEY required")
		os.Exit(1)
	}

	// Validate category locally too
	switch *category {
	case "assets", "brand", "private", "signed":
		// OK
	default:
		fmt.Println("Error: category must be one of: assets, brand, private, signed")
		os.Exit(1)
	}

	// 1. Calculate Hash
	fileData, err := os.ReadFile(*filePath)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		os.Exit(1)
	}
	contentHash := security.CalculateHash(fileData)

	// 2. Prepare Multipart Body
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, _ := writer.CreateFormFile("file", filepath.Base(*filePath))
	io.Copy(part, bytes.NewReader(fileData))

	if *targetPath != "" {
		writer.WriteField("path", *targetPath)
	}
	if *accountID != "" {
		writer.WriteField("account", *accountID)
	}
	if *category != "" {
		writer.WriteField("category", *category)
	}
	writer.Close()

	// 3. Generate Headers
	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	signature := security.GenerateSignature(key, "POST", "/upload", timestamp, contentHash)

	// 4. Send Request
	req, _ := http.NewRequest("POST", *host+"/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Time", timestamp)
	req.Header.Set("X-Hash", contentHash)
	req.Header.Set("X-Signature", signature)

	fmt.Printf("Uploading %s (Hash: %s)...\n", *filePath, contentHash)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusCreated {
		fmt.Printf("Failed: %s\n", string(respBody))
		os.Exit(1)
	}

	// 5. Parse Response
	var result UploadResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		fmt.Println("Success, but could not parse response JSON.")
		return
	}

	if result.Success {
		fmt.Println("Upload successful!")
		fmt.Printf("URL: %s\n", result.Path)
	} else {
		fmt.Printf("Upload logic failed: %s\n", string(respBody))
	}
}
