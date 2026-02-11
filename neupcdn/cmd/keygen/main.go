package main

import (
	"crypto/ed25519"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"
)

func main() {
	// 1. Generate Account Keys
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		log.Fatal(err)
	}

	pubHex := hex.EncodeToString(pub)
	privHex := hex.EncodeToString(priv)

	fmt.Println("=== NEW ED25519 KEY PAIR ===")
	fmt.Printf("ACCOUNT:     %s\n", "default")
	fmt.Printf("PUBLIC_KEY:  %s\n", pubHex)
	fmt.Printf("PRIVATE_KEY: %s\n", privHex)
	fmt.Println("============================")

	// 2. Update .env.example
	exampleFile := ".env.example"
	content, _ := os.ReadFile(exampleFile)
	lines := strings.Split(string(content), "\n")

	// Check if we already have a basic .env structure, if not create one
	if len(lines) < 2 {
		lines = []string{
			"PORT=3000",
			"PUBLIC_ROOT=/home/ubuntu/public",
			"UPLOAD_SIGNING_KEY=place-your-secure-key-here",
			"MAX_UPLOAD_SIZE=52428800",
			"",
			"# Account Public Keys",
		}
	}

	// Append the new public key to .env.example
	newKeyLine := fmt.Sprintf("PUBLIC_KEY_%s=%s", "default", pubHex)
	
	// Check if already exists to avoid duplicates
	exists := false
	for i, line := range lines {
		if strings.HasPrefix(line, "PUBLIC_KEY_default=") {
			lines[i] = newKeyLine
			exists = true
			break
		}
	}
	if !exists {
		lines = append(lines, newKeyLine)
	}

	err = os.WriteFile(exampleFile, []byte(strings.Join(lines, "\n")), 0644)
	if err != nil {
		fmt.Printf("Error updating %s: %v\n", exampleFile, err)
	} else {
		fmt.Printf("\nGenerated keys and updated %s.\n", exampleFile)
		fmt.Println("You can now copy the values from .env.example to your .env file.")
	}
}
