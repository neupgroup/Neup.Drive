package security

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/zeebo/blake3"
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
	Payload   string `json:"payload"`
	Signature string `json:"signature"`
}

func decodeUploadToken(tokenString string) (*SignedUploadToken, error) {
	var token SignedUploadToken
	decoded, err := base64.RawURLEncoding.DecodeString(tokenString)
	if err != nil {
		decoded, err = base64.URLEncoding.DecodeString(tokenString)
		if err != nil {
			decoded, err = base64.StdEncoding.DecodeString(tokenString)
			if err != nil {
				return nil, errors.New("invalid token format")
			}
		}
	}

	if err := json.Unmarshal(decoded, &token); err != nil {
		return nil, errors.New("invalid token format")
	}

	return &token, nil
}

// CalculateHash returns the BLAKE3 hex string of the data
func CalculateHash(data []byte) string {
	h := blake3.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

// VerifyEd25519Token validates the token using Ed25519 public key
func VerifyEd25519Token(tokenJSON string, publicKeyHex string) (*UploadSignaturePayload, error) {
	// 1. Parse the token
	token, err := decodeUploadToken(tokenJSON)
	if err != nil {
		return nil, err
	}

	// 2. Decode Public Key
	pubKey, err := hex.DecodeString(publicKeyHex)
	if err != nil || len(pubKey) != ed25519.PublicKeySize {
		return nil, errors.New("invalid public key configuration")
	}

	// 3. Verify signature
	// The signature was created on the raw Base64 string of the payload
	// This ensures byte-for-byte consistency between signing and verification
	sigBytes, err := hex.DecodeString(token.Signature)
	if err != nil || len(sigBytes) != ed25519.SignatureSize {
		return nil, errors.New("invalid signature format")
	}

	if !ed25519.Verify(pubKey, []byte(token.Payload), sigBytes) {
		return nil, errors.New("invalid signature")
	}

	// 4. Decode Payload
	// Use RawURLEncoding because client strips padding
	payloadBytes, err := base64.RawURLEncoding.DecodeString(token.Payload)
	if err != nil {
		// Fallback to standard URL encoding (with padding) just in case
		payloadBytes, err = base64.URLEncoding.DecodeString(token.Payload)
		if err != nil {
			// Fallback to standard encoding
			payloadBytes, err = base64.StdEncoding.DecodeString(token.Payload)
			if err != nil {
				return nil, errors.New("failed to decode base64 payload: " + err.Error())
			}
		}
	}

	var payload UploadSignaturePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, errors.New("failed to unmarshal payload json")
	}

	// 5. Check expiration
	if time.Now().Unix() > payload.ExpiresAt {
		return nil, errors.New("token expired")
	}

	return &payload, nil
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
