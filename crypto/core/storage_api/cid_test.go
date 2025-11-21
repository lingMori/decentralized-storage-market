package api

import (
	"testing"
)

func TestCalculateFileCID(T *testing.T) {
	path := "/Users/panzhuochen/offchain-storage/test.txt"
	cid, err := CalculateFileCID(path)
	if err != nil {
		T.Error(err)
	} else {
		T.Log(cid)
	}
}
