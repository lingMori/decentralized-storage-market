package api

import (
	"fmt"
	"os"

	shell "github.com/ipfs/go-ipfs-api"
)

// CalculateFileCID takes a file path and returns the CID of the file
func CalculateFileCID(filePath string) (string, error) {
	// Connect to the local IPFS daemon
	sh := shell.NewShell("localhost:5001")

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("error opening file: %w", err)
	}
	defer file.Close()

	// Add the file to IPFS
	cid, err := sh.Add(file)
	if err != nil {
		return "", fmt.Errorf("error adding file to IPFS: %w", err)
	}

	return cid, nil
}
