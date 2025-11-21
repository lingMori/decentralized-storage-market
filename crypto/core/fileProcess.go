package core

import (
	"fmt"
	"io"
	"os"
)

func SplitFileIntoBlocks(filePath string, blockSize int) (func() ([]byte, error), error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("error opening file: %v", err)
	}

	block := make([]byte, blockSize)

	return func() ([]byte, error) {
		n, err := io.ReadFull(file, block)
		if err == io.EOF {
			return nil, nil
		}

		if err == io.ErrUnexpectedEOF {
			return block[:n], nil
		}

		if err != nil {
			return nil, fmt.Errorf("error reading file: %v", err)
		}

		return block, nil
	}, nil
}

func AssembleFileFromBlocks(filePath string) (func([]byte) error, error) {
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("error opening file: %v", err)
	}

	return func(block []byte) error {
		_, err := file.Write(block)
		if err != nil {
			return fmt.Errorf("error writing to file: %v", err)
		}

		return nil
	}, nil
}
