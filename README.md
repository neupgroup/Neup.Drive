# Neup Drive

A modern file storage solution with a distributed architecture.

## Architecture

Neup Drive consists of two separate applications:

1.  **Main Application (Next.js)**: 
    - Handles User Interface, Authentication, File Management, and Metadata.
    - Generates signed tokens for uploads.
    - Located in the root directory.

2.  **CDN Gateway (Go)**:
    - A high-performance, standalone microservice for handling file uploads and downloads.
    - Located in `neupcdn/`.
    - Accepts file chunks directly from the client.

## Getting Started

### 1. Run the Main Application

```bash
npm install
npm run dev
```
Starts the Next.js app on `http://localhost:3000`.

### 2. Run the CDN Gateway

Open a new terminal:

```bash
cd neupcdn
go mod tidy
go run main.go
```
Starts the Go CDN on `http://localhost:3001` (ensure PORT is configured in `neupcdn/.env`).

## Upload Flow

1.  **Browser** -> **Main App**: Request upload (`POST /bridge/api.v1/drive/upload/init`).
2.  **Main App**: Validates request and returns a signed token.
3.  **Browser** -> **CDN**: Uploads file chunks (`PUT /upload`) using the token.
4.  **CDN** -> **Main App**: Calls webhook (`POST /bridge/webhook.v1/upload/callback`) upon completion.
5.  **Main App**: Marks file as verified.

## CDN Endpoints

The CDN is API-only. Hitting `https://neupcdn.com/` returns a JSON 404 response.

- `PUT /upload`
- `GET /list`
- `POST /operate/move`
- `POST /operate/rename`
- `POST /operate/delete`
- `GET /files/{accountId}/{type}/{relativePath}`

## Environment Variables

Ensure both applications share the same `UPLOAD_SECRET_KEY` for token verification.

### Main App (`.env.local`)
```env
UPLOAD_SECRET_KEY=super-secret-key
CDN_URL=http://localhost:3001/upload
```

### CDN (`neupcdn/.env`)
```env
PORT=3001
UPLOAD_SECRET_KEY=super-secret-key
CALLBACK_URL=http://localhost:3000/bridge/webhook.v1/upload/callback
PUBLIC_ROOT=./uploads
```
