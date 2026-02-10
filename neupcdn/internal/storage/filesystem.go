package storage

import (
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type PendingUpload struct {
	Token       string
	AccountID   string
	Category    string
	Path        string
	ContentHash string
	ExpiresAt   time.Time
}

var (
	pendingMu sync.Mutex
	pending   = make(map[string]*PendingUpload)
)

func RegisterPending(p *PendingUpload) {
	pendingMu.Lock()
	defer pendingMu.Unlock()
	pending[p.Token] = p

	// Cleanup task (simple)
	time.AfterFunc(time.Until(p.ExpiresAt), func() {
		pendingMu.Lock()
		defer pendingMu.Unlock()
		delete(pending, p.Token)
	})
}

func GetPending(token string) (*PendingUpload, bool) {
	pendingMu.Lock()
	defer pendingMu.Unlock()
	p, ok := pending[token]
	if ok && time.Now().Before(p.ExpiresAt) {
		return p, true
	}
	return nil, false
}

func AtomicWrite(path string, src io.Reader) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	tmpPath := path + ".tmp"
	f, err := os.Create(tmpPath)
	if err != nil {
		return err
	}

	if _, err := io.Copy(f, src); err != nil {
		f.Close()
		os.Remove(tmpPath)
		return err
	}
	f.Close()

	return os.Rename(tmpPath, path)
}

func VerifyAndFinalize(p *PendingUpload, actualHasher io.Reader) error {
	// Implementation to be used by SFTP close or HTTP complete
	return nil // placeholder
}
