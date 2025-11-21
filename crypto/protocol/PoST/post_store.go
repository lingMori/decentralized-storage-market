package PoST

import (
	"errors"
	"math/big"
)

var errStore = errors.New("error pangu add : input length must be 64 bytes")

type storePrecompile struct{}

func (p *storePrecompile) RequiredGas(input []byte) uint64 {
	// 自定义Gas计算方法
	// Input为 tx msg 中的 data，如果需要按操作计算Gas，需要自行解析
	return 10
}

func (p *storePrecompile) Run(input []byte) ([]byte, error) {
	if len(input) < 10 { // 确保至少有两个长度前缀和一些数据
		return nil, errStore
	}

	offset := 0

	// 解析 c 和 d 的长度
	cLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2
	dLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2

	// 确保输入数据足够长以包含 c, d, p, q, t, k
	if len(input) < offset+cLen+dLen+4*32 {
		return nil, errStore
	}

	// 解析 c 和 d
	c := input[offset : offset+cLen]
	offset += cLen
	d := input[offset : offset+dLen]
	offset += dLen

	// 解析 p, q, t, k
	pBytes := input[offset : offset+32]
	offset += 32
	qBytes := input[offset : offset+32]
	offset += 32
	tBytes := input[offset : offset+32]
	offset += 32
	kBytes := input[offset : offset+32]
	offset += 32

	// 将字节数据转换为大数和整数
	pBig := new(big.Int).SetBytes(pBytes)
	qBig := new(big.Int).SetBytes(qBytes)
	tBig := new(big.Int).SetBytes(tBytes)
	kBig := new(big.Int).SetBytes(kBytes)

	tInt := int(tBig.Int64())
	kInt := int(kBig.Int64())

	// 调用 store 函数
	cs, vs := store(c, d, pBig, qBig, tInt, kInt)
	return append(cs, vs...), nil
}
