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
	fmt.Printf("UPLOAD_SECRET_PUBLIC_KEY:  %s\n", pubHex)
	fmt.Printf("UPLOAD_SECRET_PRIVATE_KEY: %s\n", privHex)
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
			"UPLOAD_SECRET_PUBLIC_KEY=",
			"UPLOAD_SECRET_PRIVATE_KEY=",
			"MAX_UPLOAD_SIZE=52428800",
		}
	}

	// Update keys in .env.example
	pubKeyLine := fmt.Sprintf("UPLOAD_SECRET_PUBLIC_KEY=%s", pubHex)
	privKeyLine := fmt.Sprintf("UPLOAD_SECRET_PRIVATE_KEY=%s", privHex)

	updated := false
	for i, line := range lines {
		if strings.HasPrefix(line, "UPLOAD_SECRET_PUBLIC_KEY=") {
			lines[i] = pubKeyLine
			updated = true
		} else if strings.HasPrefix(line, "UPLOAD_SECRET_PRIVATE_KEY=") {
			lines[i] = privKeyLine
		}
	}

	if !updated {
		lines = append(lines, pubKeyLine)
		lines = append(lines, privKeyLine)
	}

	err = os.WriteFile(exampleFile, []byte(strings.Join(lines, "\n")), 0644)
	if err != nil {
		fmt.Printf("Error updating %s: %v\n", exampleFile, err)
	} else {
		fmt.Printf("\nGenerated keys and updated %s.\n", exampleFile)
		fmt.Println("You can now copy the values from .env.example to your .env file.")
	}
}
