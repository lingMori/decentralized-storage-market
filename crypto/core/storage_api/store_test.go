package api

import (
	"testing"
)

func TestStore(T *testing.T) {
	localFilePath := "/Users/panzhuochen/offchain-storage/hello1" // 用户只需要提供文件路径

	store(localFilePath)
}
