package security

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"
)

// CalculateHash returns the SHA256 hex string of the data
func CalculateHash(data []byte) string {
	h := sha256.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

// SignRequest signs the data using an Ed25519 private key
func SignRequest(privateKey ed25519.PrivateKey, method, path, timestamp, contentHash string) string {
	stringToSign := fmt.Sprintf("%s\n%s\n%s\n%s", method, path, timestamp, contentHash)
	signature := ed25519.Sign(privateKey, []byte(stringToSign))
	return hex.EncodeToString(signature)
}

// VerifyRequest verifies the signature using an Ed25519 public key
func VerifyRequest(publicKey ed25519.PublicKey, method, path, timestamp, contentHash, signature string) error {
	// 1. Check timestamp (prevent replay, allow 5 min drift)
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return errors.New("invalid timestamp")
	}
	now := time.Now().Unix()
	if now-ts > 300 || ts-now > 300 {
		return errors.New("request expired")
	}

	// 2. Decode signature
	sigBytes, err := hex.DecodeString(signature)
	if err != nil || len(sigBytes) != ed25519.SignatureSize {
		return errors.New("invalid signature format")
	}

	// 3. Verify
	stringToVerify := fmt.Sprintf("%s\n%s\n%s\n%s", method, path, timestamp, contentHash)
	if !ed25519.Verify(publicKey, []byte(stringToVerify), sigBytes) {
		return errors.New("bad signature")
	}

	return nil
}
