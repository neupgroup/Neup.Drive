package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"golang.org/x/crypto/ssh"
)

func main() {
	// Flags
	keyPath := flag.String("key", "client_key", "Path to private key file")
	account := flag.String("account", "", "Account ID (required)")
	category := flag.String("category", "assets", "Upload category")
	serverURL := flag.String("server", "http://localhost:3000", "Server URL")
	flag.Parse()

	files := flag.Args()
	if *account == "" {
		fmt.Println("Error: -account is required")
		flag.Usage()
		os.Exit(1)
	}
	if len(files) == 0 {
		fmt.Println("Error: No files specified")
		flag.Usage()
		os.Exit(1)
	}

	// 1. Load Private Key
	privKey, err := loadPrivateKey(*keyPath)
	if err != nil {
		fmt.Printf("Error loading key: %v\n", err)
		os.Exit(1)
	}

	// 2. Upload Files
	fmt.Printf("Uploading %d files to %s/%s...\n", len(files), *account, *category)
	
	successCount := 0
	for _, fpath := range files {
		err := uploadFile(*serverURL, *account, *category, fpath, privKey)
		if err != nil {
			fmt.Printf("❌ %s: %v\n", filepath.Base(fpath), err)
		} else {
			fmt.Printf("✅ %s\n", filepath.Base(fpath))
			successCount++
		}
	}

	fmt.Printf("\nDone! %d/%d files uploaded successfully.\n", successCount, len(files))
}

func loadPrivateKey(path string) (ed25519.PrivateKey, error) {
	keyBytes, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Parse PEM
	rawKey, err := ssh.ParseRawPrivateKey(keyBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	// Assert Ed25519
	edKey, ok := rawKey.(*ed25519.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("key is not an Ed25519 private key")
	}

	return *edKey, nil
}

func uploadFile(url, account, category, fpath string, privKey ed25519.PrivateKey) error {
	// 1. Calculate Hash
	f, err := os.Open(fpath)
	if err != nil {
		return err
	}
	defer f.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, f); err != nil {
		return err
	}
	contentHash := hex.EncodeToString(hasher.Sum(nil))
	f.Seek(0, 0) // Reset for upload

	// 2. Prepare Metadata
	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	path := "/upload"
	method := "POST"
	
	// 3. Sign
	stringToSign := fmt.Sprintf("%s\n%s\n%s\n%s", method, path, timestamp, contentHash)
	signature := hex.EncodeToString(ed25519.Sign(privKey, []byte(stringToSign)))

	// 4. Create Request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	writer.WriteField("account", account)
	writer.WriteField("category", category)
	// Use filename as path
	writer.WriteField("path", filepath.Base(fpath))
	
	part, err := writer.CreateFormFile("file", filepath.Base(fpath))
	if err != nil {
		return err
	}
	if _, err := io.Copy(part, f); err != nil {
		return err
	}
	writer.Close()

	req, err := http.NewRequest("POST", url+"/upload", body)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Time", timestamp)
	req.Header.Set("X-Hash", contentHash)
	req.Header.Set("X-Signature", signature)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse response for pretty output
	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)
	// fmt.Printf("Uploaded to: %v\n", res["path"])
	
	return nil
}
