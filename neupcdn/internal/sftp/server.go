package sftp

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/hex"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
	"neupcdn/config"
	"neupcdn/internal/security"
	"neupcdn/internal/storage"
)

const hostKeyPath = "host_key"

func StartServer() {
	sshConfig := &ssh.ServerConfig{
		PasswordCallback: func(conn ssh.ConnMetadata, password []byte) (*ssh.Permissions, error) {
			pw := string(password)
			// 1. Try token first (two-step process)
			if p, ok := storage.GetPending(pw); ok && p.AccountID == conn.User() {
				return &ssh.Permissions{
					Extensions: map[string]string{
						"token":    pw,
						"account":  p.AccountID,
						"category": p.Category,
						"path":     p.Path,
						"hash":     p.ContentHash,
					},
				}, nil
			}

			// 2. Try single-step integrated authentication (Password = Signature)
			parts := strings.Split(conn.User(), ":")
			if len(parts) >= 5 {
				account := parts[0]
				category := parts[1]
				path := parts[2]
				timestamp := parts[3]
				hash := parts[4]

				pubKeyHex, ok := config.Cfg.AccountPublicKeys[account]
				if !ok {
					return nil, fmt.Errorf("unauthorized")
				}
				pubBytes, err := hex.DecodeString(pubKeyHex)
				if err != nil || len(pubBytes) != ed25519.PublicKeySize {
					return nil, fmt.Errorf("server error: invalid account key configuration")
				}
				pub := ed25519.PublicKey(pubBytes)

				if err := security.VerifyRequest(pub, "POST", "/upload", timestamp, hash, pw); err == nil {
					return &ssh.Permissions{
						Extensions: map[string]string{
							"account":  account,
							"category": category,
							"path":     path,
							"hash":     hash,
						},
					}, nil
				}
			}

			return nil, fmt.Errorf("auth failed")
		},
		PublicKeyCallback: func(conn ssh.ConnMetadata, key ssh.PublicKey) (*ssh.Permissions, error) {
			// 3. Try single-step integrated authentication (SSH Key)
			parts := strings.Split(conn.User(), ":")
			if len(parts) >= 5 {
				account := parts[0]
				category := parts[1]
				path := parts[2]
				// timestamp and hash are still needed for metadata, even if we don't verify signature
				hash := parts[4]

				pubKeyHex, ok := config.Cfg.AccountPublicKeys[account]
				if !ok {
					return nil, fmt.Errorf("unauthorized")
				}
				pubBytes, err := hex.DecodeString(pubKeyHex)
				if err != nil || len(pubBytes) != ed25519.PublicKeySize {
					return nil, fmt.Errorf("server error: invalid account key configuration")
				}
				stdPub := ed25519.PublicKey(pubBytes)
				
				allowedKey, err := ssh.NewPublicKey(stdPub)
				if err != nil {
					return nil, fmt.Errorf("key conversion error")
				}

				if ssh.KeysEqual(key, allowedKey) {
					return &ssh.Permissions{
						Extensions: map[string]string{
							"account":  account,
							"category": category,
							"path":     path,
							"hash":     hash,
						},
					}, nil
				}
			}
			return nil, fmt.Errorf("public key auth failed")
		},
	}

	// Persist the host key so the server identity remains stable
	signer := getOrGenerateHostKey()
	sshConfig.AddHostKey(signer)

	listener, err := net.Listen("tcp", ":2022")
	if err != nil {
		log.Fatal(err) // Simplified error logging
	}

	log.Println("Secure SFTP gateway listening on :2022") // Updated log message

	for {
		nConn, err := listener.Accept()
		if err != nil {
			continue
		}

		go handleConn(nConn, sshConfig)
	}
}

func getOrGenerateHostKey() ssh.Signer {
	path := config.Cfg.SFTPHostKeyPath
	data, err := os.ReadFile(path)
	if err != nil {
		// Generate new Ed25519 host key
		pub, priv, _ := ed25519.GenerateKey(rand.Reader)
		_ = pub

		// Encode to PKCS8 PEM for storage
		bytes, _ := x509.MarshalPKCS8PrivateKey(priv)
		pemBlock := &pem.Block{
			Type:  "PRIVATE KEY",
			Bytes: bytes,
		}
		data = pem.EncodeToMemory(pemBlock)
		os.WriteFile(path, data, 0600)
		log.Printf("New host key generated and saved at: %s", path)
	}
	signer, err := ssh.ParsePrivateKey(data)
	if err != nil {
		log.Fatalf("Failed to parse host key at %s: %v", path, err)
	}
	return signer
}

func handleConn(nConn net.Conn, config *ssh.ServerConfig) {
	sConn, chans, reqs, err := ssh.NewServerConn(nConn, config)
	if err != nil {
		return
	}
	go ssh.DiscardRequests(reqs)

	for newChannel := range chans {
		if newChannel.ChannelType() != "session" {
			newChannel.Reject(ssh.UnknownChannelType, "unknown channel type")
			continue
		}
		channel, requests, err := newChannel.Accept()
		if err != nil {
			continue
		}

		go func(in <-chan *ssh.Request) {
			for req := range in {
				ok := false
				if req.Type == "subsystem" && string(req.Payload[4:]) == "sftp" {
					ok = true
					go handleSftp(channel, sConn.Permissions)
				}
				req.Reply(ok, nil)
			}
		}(requests)
	}
}

func handleSftp(channel io.ReadWriteCloser, perms *ssh.Permissions) {
	// 1. Determine Jail Path
	var jailPath string
	if perms != nil && perms.Extensions != nil {
		account := perms.Extensions["account"]
		category := perms.Extensions["category"]
		if account != "" && category != "" {
			// Basic sanitization to prevent directory traversal
			account = filepath.Base(account)
			category = filepath.Base(category)
			jailPath = filepath.Join(config.Cfg.PublicRoot, account, category)
		}
	}

	// 2. Create SFTP Server Options
	var opts []sftp.ServerOption
	if jailPath != "" {
		if err := os.MkdirAll(jailPath, 0755); err != nil {
			log.Printf("Failed to create jail directory: %v", err)
			return
		}
		opts = append(opts, sftp.WithServerWorkingDirectory(jailPath))
		
		// 3. Use Secure Handlers
		expectedPath := ""
		expectedHash := ""
		if perms != nil && perms.Extensions != nil {
			expectedPath = perms.Extensions["path"]
			expectedHash = perms.Extensions["hash"]
		}

		handler := &SecureFS{
			jailPath:     jailPath,
			expectedPath: expectedPath,
			expectedHash: expectedHash,
		}
		opts = append(opts, sftp.WithHandlers(handler))
	}

	// Use the NewServer API for local filesystem access
	server, err := sftp.NewServer(channel, opts...)
	if err != nil {
		log.Printf("Failed to create SFTP server: %v", err)
		return
	}
	
	if err := server.Serve(); err != nil {
		if err != io.EOF {
			log.Printf("SFTP session closed with error: %v", err)
		}
	}
}
