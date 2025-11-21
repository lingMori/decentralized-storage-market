package core

import (
	"fmt"
	"io"
	"log"
	"testing"
)

func TestFileProcess(T *testing.T) {
	// Size of each block
	blockSize := 1024

	// Original file to split
	originalFilePath := "/Users/panzhuochen/repository/offChainStorage/test.txt"

	// File path to store assembled file
	assembledFilePath := "/Users/panzhuochen/repository/offChainStorage/test2.txt"

	// Get the block splitter
	nextBlock, err := SplitFileIntoBlocks(originalFilePath, blockSize)
	if err != nil {
		log.Fatalf("Error splitting file into blocks: %v", err)
	}

	// Get the block assembler
	assembleBlock, err := AssembleFileFromBlocks(assembledFilePath)
	if err != nil {
		log.Fatalf("Error creating file assembler: %v", err)
	}

	// Read all blocks and assemble them
	for {
		block, err := nextBlock()
		if err != nil && err != io.EOF {
			log.Fatalf("Error reading next block: %v", err)
		}

		// If block is nil, we've reached the end of the file
		if block == nil {
			break
		}

		// Assemble the block
		err = assembleBlock(block)
		if err != nil {
			log.Fatalf("Error assembling block: %v", err)
		}
	}

	fmt.Println("File assembled successfully.")
}
