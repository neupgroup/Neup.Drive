# NeupDrive & NeupCDN Execution Guide

This guide explains how to configure, run, and manage the NeupDrive ecosystem.

## 1. Key Generation & Configuration

We use **Ed25519** asymmetric cryptography. The backend (NeupCDN) needs the Public Key to verify uploads, and the frontend (Drive App) needs the Private Key to sign upload requests.

1.  **Generate Keys:**
    ```bash
    cd neupcdn
    go run cmd/keygen/main.go
    ```
    This will output `UPLOAD_SECRET_PUBLIC_KEY` and `UPLOAD_SECRET_PRIVATE_KEY` and update `.env.example`.

2.  **Configure NeupCDN (Backend):**
    *   Copy `.env.example` to `.env` in `neupcdn/`.
    *   Set `UPLOAD_SECRET_PUBLIC_KEY` with the generated public key.
    *   *Note: NeupCDN does not need the private key.*

3.  **Configure Drive App (Frontend):**
    *   Create or update `.env` in the root `neupdrive/` directory.
    *   Set `UPLOAD_SECRET_PRIVATE_KEY` with the generated private key.
    *   *Note: The CDN URL is hardcoded to `https://neupcdn.com/upload`.*

## 2. Running NeupCDN

1.  Navigate to `neupcdn`:
    ```bash
    cd neupcdn
    ```
2.  Build and Run:
    ```bash
    go build -o neupcdn
    ./neupcdn
    ```

## 3. Running Drive App

1.  Navigate to root `neupdrive`.
2.  Run:
    ```bash
    npm run dev
    ```

## 4. Troubleshooting

*   **Invalid Signature:** Ensure the Public Key in NeupCDN matches the Private Key used by the Drive App.
*   **Logs:** Check `neupcdn/upload.error.log` for verification failures.
