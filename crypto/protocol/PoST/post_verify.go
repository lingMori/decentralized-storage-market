package PoST

import (
	"errors"
	"math/big"
)

var errVerify = errors.New("error pangu verify: input length is insufficient")

type verifyPrecompile struct{}

func (p *verifyPrecompile) RequiredGas(input []byte) uint64 {
	// 自定义Gas计算方法
	// Input为 tx msg 中的 data，如果需要按操作计算Gas，需要自行解析
	return 30
}

func (p *verifyPrecompile) Run(input []byte) ([]byte, error) {
	if len(input) < 12 { // 确保至少有三个长度前缀和一些数据
		return nil, errVerify
	}

	offset := 0

	// 解析 c, b, a 的长度
	cLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2
	bLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2
	aLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2

	// 确保输入数据足够长以包含 c, b, a, n, t
	if len(input) < offset+cLen+bLen+aLen+32+4 {
		return nil, errVerify
	}

	// 解析 c, b, a
	c := input[offset : offset+cLen]
	offset += cLen
	b := input[offset : offset+bLen]
	offset += bLen
	a := input[offset : offset+aLen]
	offset += aLen

	// 解析 n, t
	nBytes := input[offset : offset+32]
	offset += 32
	tBytes := input[offset : offset+4]
	offset += 4

	// 将字节数据转换为大数和整数
	nBig := new(big.Int).SetBytes(nBytes)
	tInt := int(new(big.Int).SetBytes(tBytes).Uint64())

	// 调用 verify 函数
	valid := verify(c, b, a, nBig, uint(tInt))

	// 返回验证结果
	if valid {
		return []byte{1}, nil
	} else {
		return []byte{0}, nil
	}
}
