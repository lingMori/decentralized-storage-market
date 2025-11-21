package core

import (
	"fmt"
	"testing"
)

func TestFileInfo(T *testing.T) {
	path := "/Users/panzhuochen/offchain-storage/test.txt"
	fmt.Println(getFileCID(path))
	info, err := GetFileInfo(path)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("Name: %s\n", info.Name)
		fmt.Printf("Size: %d bytes\n", info.Size)
		fmt.Printf("Path: %s\n", info.Path)
		fmt.Printf("Is Symlink: %v\n", info.IsSymlink)
	}
	fmt.Println(getFileMD5Hash(path))
}
