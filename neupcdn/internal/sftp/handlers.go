package sftp

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
    "hash"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/pkg/sftp"
)

type SecureFS struct {
	jailPath     string
	expectedPath string
	expectedHash string
}

func (fs *SecureFS) Fileread(r *sftp.Request) (io.ReaderAt, error) {
	// Only allow reading if needed? 
	// The original impl allowed full read/write in jail.
	// For now we default to basic file reading within jail.
	path := filepath.Join(fs.jailPath, cleanPath(r.Filepath))
	return os.Open(path)
}

func (fs *SecureFS) Filewrite(r *sftp.Request) (io.WriterAt, error) {
	// 1. Enforce Path
	// The client might send "/filename.png" or "filename.png" or "/account/category/filename.png" depending on client.
	// Since we set WorkingDirectory to jail, cleanPath(r.Filepath) should be relative to it.
	requestPath := cleanPath(r.Filepath)
	
	// If expectedPath is set, we MUST match it.
	if fs.expectedPath != "" && requestPath != fs.expectedPath {
		return nil, fmt.Errorf("permission denied: session locked to file %s", fs.expectedPath)
	}

	fullPath := filepath.Join(fs.jailPath, requestPath)
	
	// Create the file
	f, err := os.Create(fullPath)
	if err != nil {
		return nil, err
	}

	return &SecureFileWriter{
		f:            f,
		expectedHash: fs.expectedHash,
		hasher:       sha256.New(),
		path:         fullPath,
	}, nil
}

func (fs *SecureFS) Filecmd(r *sftp.Request) error {
	// Allow basic commands?
	// For "Zero Trust", we might want to disable Rename/Remove/Mkdir/Symlink?
	// But standard SFTP clients might try them.
	// For now, let's implement basic file operations restricted to jail.
	// BUT sftp.Handlers interface doesn't make it easy to reuse default impl.
	// So we have to implement them or return error.
	
	path := filepath.Join(fs.jailPath, cleanPath(r.Filepath))
	target := filepath.Join(fs.jailPath, cleanPath(r.Target)) // For rename/link

	switch r.Method {
	case "Setstat", "Rename", "Rmdir", "Mkdir", "Link", "Symlink", "Remove":
		// Disallow metadata changes or deletions for now to keep it simple and secure?
		// Actually, standard SFTP clients might need to set mtime (Setstat).
		// Let's just return permission denied for everything except maybe Remove?
        // Use path and target variables to avoid "unused variable" error if we ever implement logic
        _ = path
        _ = target
		return fmt.Errorf("operation not permitted in secure upload mode")
	}
	return nil
}

// ListerAtImpl is a wrapper to implement sftp.ListerAt
type ListerAtImpl []os.FileInfo

func (l ListerAtImpl) ListAt(f []os.FileInfo) int {
    // This method is not strictly used by the pkg/sftp interface for simple listing but required for type assertion?
    // Actually, looking at the library, it expects a slice of os.FileInfo.
    // The error says: "[]io/fs.FileInfo does not implement github.com/pkg/sftp.ListerAt (missing method ListAt)"
    // Wait, the interface is:
    // type ListerAt interface { ListAt([]os.FileInfo, int64) (int, error) }
    // No, that's not right. The error message implies it expects a method ListAt.
    return 0
}

// Let's check the library source or documentation via search if possible.
// But for now, let's fix the Hash type and variables.

func (fs *SecureFS) Filelist(r *sftp.Request) (sftp.ListerAt, error) {
	path := filepath.Join(fs.jailPath, cleanPath(r.Filepath))
	switch r.Method {
	case "List":
		files, err := os.ReadDir(path)
		if err != nil {
			return nil, err
		}
		var stats []os.FileInfo
		for _, f := range files {
			info, err := f.Info()
			if err == nil {
				stats = append(stats, info)
			}
		}
        // pkg/sftp expects a type that implements ListerAt.
        // ListerAt is an interface: ListAt([]os.FileInfo, int64) (int, error)
        return ListerAt(stats), nil
	case "Stat":
		f, err := os.Stat(path)
		if err != nil {
			return nil, err
		}
		return ListerAt([]os.FileInfo{f}), nil
	case "Readlink":
		return nil, fmt.Errorf("readlink not supported")
	}
	return nil, nil
}

// Simple implementation of ListerAt
type ListerAt []os.FileInfo

func (l ListerAt) ListAt(ls []os.FileInfo, offset int64) (int, error) {
	if offset >= int64(len(l)) {
		return 0, io.EOF
	}
	n := copy(ls, l[offset:])
	if n < len(ls) {
		return n, io.EOF
	}
	return n, nil
}

// SecureFileWriter wraps the file to compute hash on the fly
type SecureFileWriter struct {
	f            *os.File
	hasher       hash.Hash
	expectedHash string
	path         string
	written      int64
}

func (w *SecureFileWriter) WriteAt(p []byte, off int64) (int, error) {
	// SFTP allows random write.
	// BUT we need to hash the WHOLE file.
	// If the client writes out of order, our streaming hash will be wrong.
	// Strict mode: Only allow sequential writes.
	if off != w.written {
		// Close and delete
		w.f.Close()
		os.Remove(w.path)
		return 0, fmt.Errorf("secure upload requires sequential writing")
	}

	n, err := w.f.WriteAt(p, off)
	if n > 0 {
		w.hasher.Write(p[:n])
		w.written += int64(n)
	}
	return n, err
}

// Helper to close and verify. 
// Note: sftp.Handlers doesn't have an explicit "Close" for FileWriter.
// But the sftp server calls Close() if the writer implements io.Closer.
func (w *SecureFileWriter) Close() error {
	// 1. Close the underlying file
	err := w.f.Close()
	if err != nil {
		return err
	}

	// 2. Verify Hash
	if w.expectedHash != "" {
		actualHash := hex.EncodeToString(w.hasher.Sum(nil))
		if actualHash != w.expectedHash {
			// Security Violation! Delete the file.
			os.Remove(w.path)
			return fmt.Errorf("integrity check failed: hash mismatch")
		}
	}
	
	return nil
}

func cleanPath(p string) string {
	return filepath.Clean(strings.TrimPrefix(p, "/"))
}
