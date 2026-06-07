package http

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"neupcdn/config"
	"neupcdn/internal/security"
)

func FileOperationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use POST for file operations.", nil)
		return
	}

	claims, ok := verifyFileOperationRequest(w, r)
	if !ok {
		return
	}

	if claims.Method != http.MethodPost {
		ClientErrorCode(w, http.StatusForbidden, "method_mismatch", "Token is not valid for this request method", nil)
		return
	}

	switch claims.Action {
	case "rename":
		renameFile(w, claims)
	case "move":
		moveFile(w, claims)
	case "delete":
		deleteFile(w, claims)
	default:
		ClientErrorCode(w, http.StatusBadRequest, "unsupported_action", "Unsupported file operation", nil)
	}
}

func FileViewHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use GET for file preview.", nil)
		return
	}

	claims, ok := verifyFileOperationRequest(w, r)
	if !ok {
		return
	}

	if claims.Action != "view" || claims.Method != http.MethodGet {
		ClientErrorCode(w, http.StatusForbidden, "invalid_view_token", "Token is not valid for file preview", nil)
		return
	}

	fullPath, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_path", "Invalid file path", err)
		return
	}

	info, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			ClientErrorCode(w, http.StatusNotFound, "file_not_found", "File not found", err)
			return
		}
		InternalServerError(w, "Failed to access file", err)
		return
	}
	if info.IsDir() {
		ClientErrorCode(w, http.StatusBadRequest, "not_a_file", "Preview path must be a file", nil)
		return
	}

	http.ServeFile(w, r, fullPath)
}

func verifyFileOperationRequest(w http.ResponseWriter, r *http.Request) (*security.FileOperationPayload, bool) {
	if config.Cfg.UploadPublicKey == "" {
		InternalServerError(w, "UploadPublicKey not configured in server", nil)
		return nil, false
	}

	token := r.Header.Get("x-file-operation-token")
	if token == "" {
		token = r.URL.Query().Get("token")
	}
	if token == "" {
		ClientErrorCode(w, http.StatusUnauthorized, "missing_file_operation_token", "File operation token not found", nil)
		return nil, false
	}

	claims, err := security.VerifyFileOperationToken(token, config.Cfg.UploadPublicKey)
	if err != nil {
		if err.Error() == "invalid public key configuration" {
			InternalServerError(w, "Invalid public key configuration during verification", err)
			return nil, false
		}
		switch err.Error() {
		case "invalid signature", "invalid signature format":
			ClientErrorCode(w, http.StatusForbidden, "invalid_signature", "Invalid file operation token signature", err)
		case "token expired":
			ClientErrorCode(w, http.StatusForbidden, "token_expired", "File operation token expired", err)
		case "invalid token format":
			ClientErrorCode(w, http.StatusBadRequest, "invalid_token_format", "Invalid file operation token format", err)
		default:
			ClientErrorCode(w, http.StatusForbidden, "invalid_file_operation_token", "Invalid file operation token", err)
		}
		return nil, false
	}

	if claims.AccountID == "" || claims.AccountFolder == "" || claims.FolderType == "" || claims.Path == "" || claims.Method == "" || claims.Nonce == "" {
		ClientErrorCode(w, http.StatusBadRequest, "missing_token_claim", "File operation token is missing required claims", nil)
		return nil, false
	}

	if !strings.HasPrefix(strings.TrimPrefix(claims.Path, "/"), "uploads/"+claims.AccountFolder+"/") {
		ClientErrorCode(w, http.StatusForbidden, "account_path_mismatch", "Token path does not match account folder", nil)
		return nil, false
	}

	return claims, true
}

func renameFile(w http.ResponseWriter, claims *security.FileOperationPayload) {
	if claims.NewName == "" {
		ClientErrorCode(w, http.StatusBadRequest, "missing_new_name", "new_name is required for rename", nil)
		return
	}
	if strings.ContainsAny(claims.NewName, `/\`) || claims.NewName == "." || claims.NewName == ".." {
		ClientErrorCode(w, http.StatusBadRequest, "invalid_new_name", "new_name must be a file name, not a path", nil)
		return
	}

	source, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_path", "Invalid source path", err)
		return
	}

	destRel := filepath.ToSlash(filepath.Join(filepath.Dir(claims.Path), claims.NewName))
	dest, err := safePublicPath(destRel)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_destination_path", "Invalid destination path", err)
		return
	}

	if err := renameOrMove(source, dest); err != nil {
		writeOperationError(w, err)
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success":          true,
		"action":           "rename",
		"path":             destRel,
		"destination_path": destRel,
	})
}

func moveFile(w http.ResponseWriter, claims *security.FileOperationPayload) {
	if claims.DestinationPath == "" {
		ClientErrorCode(w, http.StatusBadRequest, "missing_destination_path", "destination_path is required for move", nil)
		return
	}

	if !strings.HasPrefix(strings.TrimPrefix(claims.DestinationPath, "/"), "uploads/"+claims.AccountFolder+"/") {
		ClientErrorCode(w, http.StatusForbidden, "destination_account_mismatch", "Destination path does not match account folder", nil)
		return
	}

	source, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_path", "Invalid source path", err)
		return
	}

	destRel := strings.TrimPrefix(claims.DestinationPath, "/")
	dest, err := safePublicPath(destRel)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_destination_path", "Invalid destination path", err)
		return
	}

	if err := renameOrMove(source, dest); err != nil {
		writeOperationError(w, err)
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success":          true,
		"action":           "move",
		"path":             destRel,
		"destination_path": destRel,
	})
}

func deleteFile(w http.ResponseWriter, claims *security.FileOperationPayload) {
	source, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_path", "Invalid source path", err)
		return
	}

	info, err := os.Stat(source)
	if err != nil {
		writeOperationError(w, err)
		return
	}
	if info.IsDir() {
		ClientErrorCode(w, http.StatusBadRequest, "not_a_file", "Delete path must be a file", nil)
		return
	}

	if err := os.Remove(source); err != nil {
		InternalServerError(w, "Failed to delete file", err)
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success":      true,
		"action":       "delete",
		"deleted_path": claims.Path,
	})
}

func renameOrMove(source, dest string) error {
	info, err := os.Stat(source)
	if err != nil {
		return err
	}
	if info.IsDir() {
		return errors.New("source path must be a file")
	}

	if _, err := os.Stat(dest); err == nil {
		return errors.New("destination already exists")
	} else if !os.IsNotExist(err) {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(dest), 0755); err != nil {
		return err
	}

	return os.Rename(source, dest)
}

func safePublicPath(relPath string) (string, error) {
	if relPath == "" || strings.ContainsRune(relPath, '\x00') {
		return "", errors.New("empty or invalid path")
	}

	cleanRel := filepath.Clean(strings.TrimPrefix(relPath, "/"))
	if cleanRel == "." || strings.HasPrefix(cleanRel, ".."+string(filepath.Separator)) || cleanRel == ".." || filepath.IsAbs(cleanRel) {
		return "", errors.New("path traversal")
	}

	root, err := filepath.Abs(config.Cfg.PublicRoot)
	if err != nil {
		return "", err
	}
	fullPath, err := filepath.Abs(filepath.Join(root, cleanRel))
	if err != nil {
		return "", err
	}

	if fullPath != root && !strings.HasPrefix(fullPath, root+string(filepath.Separator)) {
		return "", errors.New("path escapes public root")
	}

	return fullPath, nil
}

func writeOperationError(w http.ResponseWriter, err error) {
	switch {
	case os.IsNotExist(err):
		ClientErrorCode(w, http.StatusNotFound, "file_not_found", "File not found", err)
	case errors.Is(err, os.ErrExist) || strings.Contains(err.Error(), "destination already exists"):
		ClientErrorCode(w, http.StatusConflict, "destination_exists", "Destination already exists", err)
	case strings.Contains(err.Error(), "source path must be a file"):
		ClientErrorCode(w, http.StatusBadRequest, "not_a_file", "Operation path must be a file", err)
	default:
		InternalServerError(w, fmt.Sprintf("File operation failed: %v", err), err)
	}
}
