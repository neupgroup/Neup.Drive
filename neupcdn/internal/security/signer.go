package security

import (
	"crypto/ed25519"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"
)

// UploadSignaturePayload matches the TypeScript interface used by the client
type UploadSignaturePayload struct {
	Path        string `json:"path"`
	AccountID   string `json:"account_id"`
	Method      string `json:"method"`
	MaxSize     int64  `json:"max_size"`
	ContentType string `json:"content_type"`
	ExpiresAt   int64  `json:"expires_at"`
	Nonce       string `json:"nonce"`
	KeyID       string `json:"key_id"`
}

// SignedUploadToken matches the client's token structure
type SignedUploadToken struct {
	Payload   UploadSignaturePayload `json:"payload"`
	Signature string                 `json:"signature"`
}

// CalculateHash returns the SHA256 hex string of the data
func CalculateHash(data []byte) string {
	h := sha256.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

// VerifyHMACSignature validates the HMAC-SHA256 signature
func VerifyHMACSignature(tokenJSON string, secretKey string) (*UploadSignaturePayload, error) {
	// 1. Parse the token
	var token SignedUploadToken
	if err := json.Unmarshal([]byte(tokenJSON), &token); err != nil {
		return nil, errors.New("invalid token format")
	}

	// 2. Re-create the signature
	payloadBytes, err := json.Marshal(token.Payload)
	if err != nil {
		return nil, errors.New("failed to marshal payload")
	}

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write(payloadBytes)
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	// 3. Verify signature matches
	if !hmac.Equal([]byte(token.Signature), []byte(expectedSignature)) {
		return nil, errors.New("invalid signature")
	}

	// 4. Check expiration
	if time.Now().Unix() > token.Payload.ExpiresAt {
		return nil, errors.New("token expired")
	}

	return &token.Payload, nil
}

// SignRequest signs the data using an Ed25519 private key (Keep legacy support)
func SignRequest(privateKey ed25519.PrivateKey, method, path, timestamp, contentHash string) string {
	stringToSign := fmt.Sprintf("%s\n%s\n%s\n%s", method, path, timestamp, contentHash)
	signature := ed25519.Sign(privateKey, []byte(stringToSign))
	return hex.EncodeToString(signature)
}

// VerifyRequest verifies the signature using an Ed25519 public key (Legacy)
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
