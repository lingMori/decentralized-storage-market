package core

import (
	"crypto/ecdsa"
	"fmt"
	"github.com/timecool-cpu/offchain-storage/core/curve"
	"github.com/timecool-cpu/offchain-storage/core/recrypt"
	"math/big"
	"path/filepath"
)

var aPriKey *ecdsa.PrivateKey
var aPubKey *ecdsa.PublicKey
var bPriKey *ecdsa.PrivateKey
var bPubKey *ecdsa.PublicKey
var rk *big.Int
var pubX *ecdsa.PublicKey

func init() {
	// Alice Generate Alice key-pair
	aPriKey, aPubKey, _ = curve.GenerateKeys()
	// Bob Generate Bob key-pair
	bPriKey, bPubKey, _ = curve.GenerateKeys()

	// Alice generates re-encryption key
	rk, pubX, _ = recrypt.ReKeyGen(aPriKey, bPubKey)
}

func Enc(path string) error {
	// 获取绝对路径
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	// 清理路径
	absPath = filepath.Clean(absPath)

	_, err = recrypt.EncryptFile(absPath, "random_encrypt.txt", aPubKey)
	if err != nil {
		fmt.Println("File Encrypt Error:", err)
	}
	return nil
}

func Dec(path string, fileCapsule *recrypt.Capsule) error {
	// 获取绝对路径
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	// 清理路径
	absPath = filepath.Clean(absPath)

	fileNewCapsule, err := recrypt.ReEncryption(rk, fileCapsule)
	if err != nil {
		fmt.Println("ReEncryption Error:", err)
	}
	err = recrypt.DecryptFile(absPath, "a_decrypt.txt", bPriKey, fileNewCapsule, pubX)
	if err != nil {
		fmt.Println("Decrypt Error:", err)
	}
	return nil
}
