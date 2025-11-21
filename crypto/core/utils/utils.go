package utils

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/hex"
	"github.com/timecool-cpu/offchain-storage/core/curve"
	"golang.org/x/crypto/sha3"
	"math/big"
)

// concat bytes
func ConcatBytes(a, b []byte) []byte {
	var buf bytes.Buffer
	buf.Write(a)
	buf.Write(b)
	return buf.Bytes()
}

// convert message to hash value
func Sha3Hash(message []byte) ([]byte, error) {
	sha := sha3.New256()
	_, err := sha.Write(message)
	if err != nil {
		return nil, err
	}
	return sha.Sum(nil), nil
}

// map hash value to curve
/*
* 这段代码是用来将给定的哈希值映射到椭圆曲线上的一个点，具体来说，它的作用是将一个字节数组 hash 转换成一个大整数 hashInt，并将其取模得到一个在椭圆曲线 curve 上的整数，返回该整数。
* 该函数的输入是一个字节数组，输出是一个大整数，该大整数在椭圆曲线上。
* 该函数的实现过程如下：
* 1. 将字节数组 hash 转换成一个大整数 hashInt。
* 2. 将 hashInt 取模得到一个在椭圆曲线 curve 上的整数。
* 3. 返回该整数。
 */
func HashToCurve(hash []byte) *big.Int {
	hashInt := new(big.Int).SetBytes(hash)
	return hashInt.Mod(hashInt, curve.N)
}

// convert private key to string
/*
* 这段代码是用来将私钥转换成字符串的，具体来说，它的作用是将私钥 privateKey 转换成一个字节数组 privateKeyBytes，然后将该字节数组转换成一个十六进制字符串。
 */
func PrivateKeyToString(privateKey *ecdsa.PrivateKey) string {
	return hex.EncodeToString(privateKey.D.Bytes())
}

// convert string to private key
func PrivateKeyStrToKey(privateKeyStr string) (*ecdsa.PrivateKey, error) {
	priKeyAsBytes, err := hex.DecodeString(privateKeyStr)
	if err != nil {
		return nil, err
	}
	d := new(big.Int).SetBytes(priKeyAsBytes)
	// compute public key
	x, y := elliptic.P256().ScalarBaseMult(priKeyAsBytes)
	pubKey := ecdsa.PublicKey{
		curve.CURVE, x, y,
	}
	key := &ecdsa.PrivateKey{
		D:         d,
		PublicKey: pubKey,
	}
	return key, nil
}

// convert public key to string
func PublicKeyToString(publicKey *ecdsa.PublicKey) string {
	pubKeyBytes := curve.PointToBytes(publicKey)
	return hex.EncodeToString(pubKeyBytes)
}

// convert public key string to key
func PublicKeyStrToKey(pubKey string) (*ecdsa.PublicKey, error) {
	pubKeyAsBytes, err := hex.DecodeString(pubKey)
	if err != nil {
		return nil, err
	}
	x, y := elliptic.Unmarshal(curve.CURVE, pubKeyAsBytes)
	key := &ecdsa.PublicKey{
		Curve: curve.CURVE,
		X:     x,
		Y:     y,
	}
	return key, nil
}
