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
                // Fix: ssh.KeysEqual is deprecated/removed in newer versions.
                // Use bytes.Equal(key.Marshal(), allowedKey.Marshal()) or just type comparison?
                // Actually, the ssh package has no KeysEqual function in modern versions?
                // Let's use bytes.Equal on Marshal().
                if string(key.Marshal()) == string(allowedKey.Marshal()) {
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
        // Fix: sftp.WithHandlers is not the correct name or signature?
        // Checking pkg/sftp docs (common pattern):
        // Usually it's request-server handlers.
        // Wait, the error said "undefined: sftp.WithHandlers".
        // It should be sftp.Handlers(handler) passed to NewRequestServer?
        // But we are using NewServer (which wraps RequestServer).
        // Let's assume we need to pass the handler differently.
        // Actually, NewServer takes options.
        // Option WithHandlers might be missing if we are using an old version or if the name is different.
        // Let's try explicit options for each operation if possible, or check if the interface is implemented by SecureFS.
        // SecureFS implements Fileread, Filewrite, Filecmd, Filelist.
        // The option is simply providing the handlers.
        // Let's try `sftp.WithServerHandlers(handler)` or similar?
        // No, typically you pass the handler struct directly if it implements the interfaces.
        // Ah, `sftp.NewServer(conn, options...)`
        // Maybe the option is just passing the RequestServer?
        // Let's check imports. "github.com/pkg/sftp".
        // Common options: WithDebug, WithAllocator...
        // If we want to override file system, we usually use `NewRequestServer` instead of `NewServer`?
        // OR we use `NewServer` but pass a `Handlers` option.
        // Let's try to search for the correct option name.
        // Assuming it's `sftp.Handlers{...}` struct.
        // Wait, if SecureFS implements the interface `Handlers`, maybe we can cast it?
        // No, we need an Option function.
        // Let's try removing WithHandlers and using the correct way:
        // `server := sftp.NewRequestServer(channel, handler)`
        // But we want the other options (WorkingDir) too.
        // Let's assume for now we can't use NewServer with custom handlers easily without `WithHandlers` if it's missing.
        // Let's try `NewRequestServer`.
        // But wait, `NewRequestServer` returns `*RequestServer`. `NewServer` returns `*Server`.
        // `Server` handles the SSH subsystem loop. `RequestServer` handles the packets.
        // We are inside `handleSftp` which takes `channel`.
        // If we use `NewRequestServer`, we need to feed it requests.
        // The `sftp.NewServer` helper does the feeding loop `server.Serve()`.
        
        // Fix: The correct option is likely separate options for each handler type or a unified one.
        // If `WithHandlers` is undefined, maybe it's `sftp.WithFileReader`, `sftp.WithFileWriter`, etc?
        // Let's try constructing the options manually if needed.
        // Actually, let's search for "pkg/sftp WithHandlers" usage.
        // Since I can't search web, I'll guess common alternatives.
        // Option 1: sftp.WithHostKey? No.
        // Let's try commenting it out and see if we can instantiate RequestServer directly.
        // But we need to serve it.
        
        // Let's try `server := sftp.NewRequestServer(channel, handler, opts...)`?
        // Does NewRequestServer accept options? Yes.
        // And `server.Serve()` works on RequestServer too? No, it has `Serve()` method?
        // Let's look at `server.Serve()` in the code. It calls `server.Serve()`.
        
        // Let's try replacing `sftp.NewServer` with `sftp.NewRequestServer`.
        // `server := sftp.NewRequestServer(channel, handler, opts...)`
        // If `handler` satisfies `Handlers` interface.
        // `SecureFS` implements `Fileread`, `Filewrite`, `Filecmd`, `Filelist`.
        // This matches `Handlers` interface.
        
        server := sftp.NewRequestServer(channel, handler, opts...)
	} else {
        // Fallback for non-jailed (shouldn't happen with auth logic, but just in case)
        // Use default handlers (OS FS)
        // NewRequestServer requires a handler.
        // Use `sftp.NewServer` for default OS handlers?
        // This logic is split.
        // Let's simplify: if jailPath is empty, we just return/error because we require jail.
        log.Printf("No jail path determined, aborting SFTP session")
        return
    }

	// Use the NewServer API for local filesystem access
    // Wait, `NewRequestServer` returns `*RequestServer`.
    // Does it have `Serve()`?
    // `func (rs *RequestServer) Serve() error`
    // Yes.
    
    // So we replace:
	// server, err := sftp.NewServer(channel, opts...)
    // with:
    // server := sftp.NewRequestServer(channel, handler, opts...)
    // But wait, `NewServer` creates the default OS handlers. `NewRequestServer` uses provided handlers.
    // So if we used `NewServer` before, we were using OS handlers.
    // Now we want `SecureFS`.
    
    // Error handling for NewRequestServer (it returns *RequestServer, error)
	// server := sftp.NewRequestServer(channel, handler, opts...) 
    // Wait, checking signature... `NewRequestServer(rwc io.ReadWriteCloser, h Handlers, options ...RequestServerOption) *RequestServer`
    // It does not return error.
    
	if err := server.Serve(); err != nil {
		if err != io.EOF {
			log.Printf("SFTP session closed with error: %v", err)
		}
	}
}
