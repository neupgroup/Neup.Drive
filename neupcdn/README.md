# Neup CDN

A Go-based CDN gateway that receives files via HTTP/SFTP and stores them on a remote storage server.

## Prerequisites

- [Go](https://go.dev/dl/) installed.

## Setup

1. **Generate your keys**: This will authorize your accounts and prepare your environment.
   ```bash
   go run cmd/keygen/main.go
   ```
   *This tool will generate your public/private keys and create/update the `.env.example` file.*

2. **Configure your Environment**:
   - Create a `.env` file.
   - Copy the required values from `.env.example` into your `.env`.
   - Update your SFTP storage credentials and `PUBLIC_ROOT`.

3. **Install dependencies**:
   ```bash
   go mod tidy
   ```

## Running the Application

```bash
# Start the HTTP (3000) and SFTP (2022) gateways
go run main.go
```

## Security Model

We use **Ed25519 Asymmetric Signatures** for zero-trust security.
- **Server**: Only stores **Public Keys** (configured in `.env` as `PUBLIC_KEY_{ACCOUNT}`).
- **Client**: Holds the **Private Key** to sign requests.

### 1. Batch Uploads (CLI Tool) - Recommended
For uploading multiple files, use the included CLI tool. It handles key loading, hashing, and signing automatically.

```bash
# Upload all PNGs to the 'assets' category
go run cmd/neup-cli/main.go -key client_key -account default -category assets *.png
```

### 2. Automated SFTP Upload (Port 2022)
**Strict Security Mode**: 
- You must authenticate using your **SSH Private Key**.
- Each session is locked to a specific **file path** and **content hash**.
- Files must be uploaded **sequentially**.
- The server verifies the SHA256 hash on-the-fly. Mismatches result in immediate deletion.

**Command:**
```bash
# Username format: account:category:filename:timestamp:hash
sftp -i client_key -P 2022 -oUser="default:assets:hero.png:1678900000:<sha256_hash>" localhost
```

### 3. HTTP API Upload
**Endpoint**: `POST /upload`
**Headers**:
- `X-Time`: Unix timestamp
- `X-Hash`: SHA256 file hash
- `X-Signature`: Ed25519 signature

**Form Fields**:
- `account`: Your account ID
- `category`: File category (e.g., `assets`, `brand`)
- `path`: (Optional) Target path/filename
- `file`: The file content

**Example Request:**
```bash
curl -X POST http://localhost:3000/upload \
  -H "X-Time: $(date +%s)" \
  -H "X-Hash: <file_sha256>" \
  -H "X-Signature: <ed25519_signature>" \
  -F "account=myaccount" \
  -F "category=assets" \
  -F "file=@/path/to/local/file.png"
```

**Response**:
```json
{
  "success": true,
  "path": "neupcdn.com/myaccount/assets/hero.png"
}
```

## directions.md

This section explains the advanced architectural choices that make Neup CDN hyper-secure for automated, high-volume file transfers.

### 1. Asymmetric "Zero-Trust" Security (Ed25519)
Unlike standard systems that share a password between client and server, we use **Asymmetric Cryptography**. Even if the CDN server is fully compromised, an attacker cannot generate new upload requests because they lack your Private Key.

### 2. Multi-Account Isolation
The server supports multiple accounts, each with its own independent Public Key. A key leak in one account cannot affect the security of any other account in the system.

### 3. Integrated SFTP Gateway (Port 2022)
We have custom-built an SFTP server that treats the connection handshake as a security layer. It generates a persistent `host_key` to prevent Man-in-the-Middle attacks.

### 4. Virtual Sandboxing (The "Jail")
When an automated system connects via SFTP, it is jailed inside its own `account/category` directory. It has zero access to the server's OS or other users' files.

### 5. Integrity Verification
As data streams in, the server computes a SHA256 hash. Only when the transfer is 100% complete is it verified against your signature. If it fails, the transfer is discarded.

### 6. Path Sanitization Logic
- All paths are lowercase and stripped of leading slashes.
- Restricted characters are replaced with `-`.
- Final URLs: `neupcdn.com/[account]/[category]/[sanitized_path]`