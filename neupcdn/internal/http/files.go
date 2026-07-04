package http

import (
	"errors"
	"fmt"
	"mime"
	"net"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"neupcdn/config"
	"neupcdn/internal/security"
)

func routeNotFound(w http.ResponseWriter) {
	ClientErrorCode(w, http.StatusNotFound, "404_not_found", "Route not found", nil)
}

func isPublicAccessType(accessType string) bool {
	return accessType == "assets" || accessType == "public" || accessType == "direct"
}

func parseFileRoute(pathValue string) (accountID, accessType, relPath string, ok bool) {
	if strings.HasPrefix(pathValue, "/files/") {
		return parseLegacyFileRoute(strings.TrimPrefix(pathValue, "/files/"))
	}

	return parseRootFileRoute(strings.TrimPrefix(pathValue, "/"))
}

func parseLegacyFileRoute(cleaned string) (accountID, accessType, relPath string, ok bool) {
	return parseAccountFileRoute(cleaned, true)
}

func parseRootFileRoute(cleaned string) (accountID, accessType, relPath string, ok bool) {
	return parseAccountFileRoute(cleaned, false)
}

func parseAccountFileRoute(cleaned string, allowSignedDuration bool) (accountID, accessType, relPath string, ok bool) {
	if cleaned == "" {
		return "", "", "", false
	}

	parts := strings.SplitN(cleaned, "/", 2)
	if len(parts) != 2 {
		return "", "", "", false
	}

	accountID = strings.TrimSpace(parts[0])
	remainder := strings.TrimSpace(parts[1])
	if accountID == "" || remainder == "" {
		return "", "", "", false
	}

	routeParts := strings.SplitN(remainder, "/", 3)
	switch routeParts[0] {
	case "signed":
		if len(routeParts) < 2 || strings.TrimSpace(routeParts[1]) == "" {
			return "", "", "", false
		}
		accessType = "signed"
		if allowSignedDuration && len(routeParts) == 3 {
			relPath = routeParts[2]
		} else {
			relPath = strings.TrimPrefix(remainder, "signed/")
		}
	case "drive":
		relPath = strings.TrimPrefix(remainder, "drive/")
		if strings.TrimSpace(relPath) == "" {
			return "", "", "", false
		}
		accessType = "drive"
	case ".trash":
		relPath = strings.TrimPrefix(remainder, ".trash/")
		if strings.TrimSpace(relPath) == "" {
			return "", "", "", false
		}
		accessType = ".trash"
	case ".logs":
		relPath = strings.TrimPrefix(remainder, ".logs/")
		if strings.TrimSpace(relPath) == "" {
			return "", "", "", false
		}
		accessType = ".logs"
	case "assets":
		relPath = strings.TrimPrefix(remainder, "assets/")
		if strings.TrimSpace(relPath) == "" {
			return "", "", "", false
		}
		accessType = "assets"
	default:
		accessType = "assets"
		relPath = remainder
	}

	return accountID, accessType, relPath, true
}

func resolveStorageRelativePath(accountID, accessType, relPath string) (string, bool) {
	cleaned := filepath.ToSlash(strings.TrimPrefix(strings.TrimSpace(relPath), "/"))
	if cleaned == "" {
		return "", false
	}

	accountPrefix := "uploads/" + accountID + "/"
	if cleaned == "uploads/"+accountID {
		return cleaned, true
	}
	if strings.HasPrefix(cleaned, accountPrefix) {
		return cleaned, true
	}

	if strings.HasPrefix(cleaned, "uploads/") {
		return "", false
	}

	typePrefix := accessType + "/"
	if accessType != "" && accessType != "drive" && !strings.HasPrefix(cleaned, typePrefix) {
		cleaned = path.Join(accessType, cleaned)
	}

	return path.Join("uploads", accountID, cleaned), true
}

func isReservedAssetsRootSignedPath(storagePath string) bool {
	cleaned := strings.TrimPrefix(filepath.ToSlash(strings.TrimSpace(storagePath)), "/")
	parts := strings.Split(cleaned, "/")
	return len(parts) >= 4 && parts[0] == "uploads" && parts[2] == "assets" && parts[3] == "signed"
}

func requestDeviceIP(r *http.Request) string {
	for _, header := range []string{"CF-Connecting-IP", "X-Real-IP", "X-Forwarded-For"} {
		value := strings.TrimSpace(r.Header.Get(header))
		if value == "" {
			continue
		}
		if header == "X-Forwarded-For" {
			value = strings.TrimSpace(strings.Split(value, ",")[0])
		}
		if value != "" {
			return value
		}
	}

	host := r.RemoteAddr
	if strings.Contains(host, ":") {
		if withoutPort, _, err := net.SplitHostPort(host); err == nil {
			return withoutPort
		}
	}
	return host
}

func FileOperationHandler(w http.ResponseWriter, r *http.Request) {
	handleFileOperation(w, r, "")
}

func FileOperationDispatchHandler(w http.ResponseWriter, r *http.Request) {
	action := strings.TrimPrefix(r.URL.Path, "/operate/")
	switch action {
	case "rename", "move", "delete":
		handleFileOperation(w, r, action)
	default:
		routeNotFound(w)
	}
}

func handleFileOperation(w http.ResponseWriter, r *http.Request, expectedAction string) {
	if r.Method != http.MethodPost {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use POST for file operations.", nil)
		return
	}

	claims, ok := verifyFileOperationRequest(w, r)
	if !ok {
		return
	}

	if expectedAction != "" && claims.Action != expectedAction {
		TokenNotFound(w, "Token action does not match the requested endpoint", nil)
		return
	}

	if claims.Method != http.MethodPost {
		TokenNotFound(w, "Token is not valid for this request method", nil)
		return
	}

	switch claims.Action {
	case "rename":
		renameFile(w, r, claims)
	case "move":
		moveFile(w, r, claims)
	case "delete":
		deleteFile(w, r, claims)
	default:
		TokenNotFound(w, "Unsupported file operation", nil)
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
		TokenNotFound(w, "Token is not valid for file preview", nil)
		return
	}

	fullPath, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
		return
	}

	info, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
			return
		}
		InternalServerError(w, "Failed to access file", err)
		return
	}
	if info.IsDir() {
		ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", nil)
		return
	}

	http.ServeFile(w, r, fullPath)
	LogActivity("file_view", r, map[string]interface{}{
		"account_id": claims.AccountID,
		"path":       claims.Path,
		"folder":     claims.FolderType,
		"status":     "served",
	})
}

func FileServeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use GET for file preview.", nil)
		return
	}

	accountID, accessType, relPath, ok := parseFileRoute(r.URL.Path)
	if !ok {
		routeNotFound(w)
		return
	}

	resolvedRelPath, ok := resolveStorageRelativePath(accountID, accessType, relPath)
	if !ok {
		routeNotFound(w)
		return
	}

	fullPath, err := safePublicPath(resolvedRelPath)
	if err != nil {
		ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
		return
	}

	if !isPublicAccessType(accessType) {
		claims, ok := verifyFileOperationRequest(w, r)
		if !ok {
			return
		}

		if claims.Action != "view" || claims.Method != http.MethodGet {
			TokenNotFound(w, "Token is not valid for file preview", nil)
			return
		}

		if claims.AccountFolder != accountID || claims.FolderType != accessType {
			TokenNotFound(w, "Token does not match the requested file path", nil)
			return
		}

		tokenPath, err := safePublicPath(claims.Path)
		if err != nil {
			ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
			return
		}

		if tokenPath != fullPath {
			TokenNotFound(w, "Token does not match the requested file path", nil)
			return
		}
	}

	info, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
			return
		}
		InternalServerError(w, "Failed to access file", err)
		return
	}
	if info.IsDir() {
		ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", nil)
		return
	}

	http.ServeFile(w, r, fullPath)
	LogActivity("file_view", r, map[string]interface{}{
		"account_id": accountID,
		"path":       resolvedRelPath,
		"folder":     accessType,
		"status":     "served",
	})
}

func FileListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ClientErrorCode(w, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed. Use GET for file listing.", nil)
		return
	}

	claims, ok := verifyFileOperationRequest(w, r)
	if !ok {
		return
	}

	if claims.Action != "list" || claims.Method != http.MethodGet {
		TokenNotFound(w, "Token is not valid for file listing", nil)
		return
	}

	rootPath, err := safePublicPath(claims.Path)
	if err != nil {
		ClientErrorCode(w, http.StatusForbidden, "invalid_path", "Invalid list path", err)
		return
	}

	info, err := os.Stat(rootPath)
	if err != nil {
		if os.IsNotExist(err) {
			JSONResponse(w, http.StatusOK, map[string]interface{}{
				"success": true,
				"files":   []interface{}{},
			})
			return
		}
		InternalServerError(w, "Failed to access list path", err)
		return
	}
	if !info.IsDir() {
		ClientErrorCode(w, http.StatusBadRequest, "not_a_directory", "List path must be a directory", nil)
		return
	}

	publicRoot, err := filepath.Abs(config.Cfg.PublicRoot)
	if err != nil {
		InternalServerError(w, "Failed to resolve public root", err)
		return
	}

	files := make([]map[string]interface{}, 0)
	walkErr := filepath.WalkDir(rootPath, func(fullPath string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}
		if strings.HasSuffix(entry.Name(), ".part") {
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(publicRoot, fullPath)
		if err != nil {
			return err
		}
		relPath = filepath.ToSlash(relPath)
		mimeType := mime.TypeByExtension(filepath.Ext(entry.Name()))
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}

		files = append(files, map[string]interface{}{
			"name":          entry.Name(),
			"path":          relPath,
			"size":          info.Size(),
			"mime_type":     mimeType,
			"modified_time": info.ModTime().UTC().Format("2006-01-02T15:04:05Z"),
		})
		return nil
	})
	if walkErr != nil {
		InternalServerError(w, "Failed to list files", walkErr)
		return
	}

	JSONResponse(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"files":   files,
	})
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
		TokenNotFound(w, "File operation token not found", nil)
		return nil, false
	}

	claims, err := security.VerifyFileOperationToken(token, config.Cfg.UploadPublicKey)
	if err != nil {
		if err.Error() == "invalid public key configuration" {
			InternalServerError(w, "Invalid public key configuration during verification", err)
			return nil, false
		}
		TokenNotFound(w, "Invalid file operation token", err)
		return nil, false
	}

	if claims.AccountID == "" || claims.AccountFolder == "" || claims.FolderType == "" || claims.Path == "" || claims.Method == "" || claims.Nonce == "" {
		TokenNotFound(w, "File operation token is missing required claims", nil)
		return nil, false
	}

	accountRoot := "uploads/" + claims.AccountFolder
	cleanPath := strings.TrimPrefix(claims.Path, "/")
	if cleanPath != accountRoot && !strings.HasPrefix(cleanPath, accountRoot+"/") {
		TokenNotFound(w, "Token path does not match account folder", nil)
		return nil, false
	}

	return claims, true
}

func renameFile(w http.ResponseWriter, r *http.Request, claims *security.FileOperationPayload) {
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
	LogActivity("file_rename", r, map[string]interface{}{
		"account_id":         claims.AccountID,
		"source_path":        claims.Path,
		"destination_path":   destRel,
		"folder":             claims.FolderType,
		"requested_new_name": claims.NewName,
	})
}

func moveFile(w http.ResponseWriter, r *http.Request, claims *security.FileOperationPayload) {
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
	if isReservedAssetsRootSignedPath(destRel) {
		ClientErrorCode(w, http.StatusBadRequest, "reserved_signed_folder", `The "signed" folder name is reserved at the top level of assets`, nil)
		return
	}
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
	LogActivity("file_move", r, map[string]interface{}{
		"account_id":       claims.AccountID,
		"source_path":      claims.Path,
		"destination_path": destRel,
		"folder":           claims.FolderType,
	})
}

func deleteFile(w http.ResponseWriter, r *http.Request, claims *security.FileOperationPayload) {
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

	if claims.DestinationPath == "" {
		if err := os.Remove(source); err != nil {
			InternalServerError(w, "Failed to delete file", err)
			return
		}

		JSONResponse(w, http.StatusOK, map[string]interface{}{
			"success":      true,
			"action":       "delete",
			"deleted_path": claims.Path,
		})
		LogActivity("file_delete", r, map[string]interface{}{
			"account_id":   claims.AccountID,
			"deleted_path": claims.Path,
			"folder":       claims.FolderType,
			"mode":         "permanent",
		})
		return
	}

	if !strings.HasPrefix(strings.TrimPrefix(claims.DestinationPath, "/"), "uploads/"+claims.AccountFolder+"/.trash/") {
		ClientErrorCode(w, http.StatusForbidden, "invalid_trash_destination", "Delete destination must be inside the account trash folder", nil)
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
		"action":           "delete",
		"path":             destRel,
		"destination_path": destRel,
		"deleted_path":     claims.Path,
	})
	LogActivity("file_delete", r, map[string]interface{}{
		"account_id":       claims.AccountID,
		"deleted_path":     claims.Path,
		"destination_path": destRel,
		"folder":           claims.FolderType,
		"mode":             "trash",
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
		ClientErrorCode(w, http.StatusNotFound, "404_not_found", "File not found", err)
	case errors.Is(err, os.ErrExist) || strings.Contains(err.Error(), "destination already exists"):
		ClientErrorCode(w, http.StatusConflict, "destination_exists", "Destination already exists", err)
	case strings.Contains(err.Error(), "source path must be a file"):
		ClientErrorCode(w, http.StatusBadRequest, "not_a_file", "Operation path must be a file", err)
	default:
		InternalServerError(w, fmt.Sprintf("File operation failed: %v", err), err)
	}
}
