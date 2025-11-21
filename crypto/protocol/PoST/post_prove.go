package PoST

import (
	"errors"
	"math/big"
)

var errProve = errors.New("error pangu prove: input length must be 64 bytes")

type provePrecompile struct{}

func (p *provePrecompile) RequiredGas(input []byte) uint64 {
	// 自定义Gas计算方法
	// Input为 tx msg 中的 data，如果需要按操作计算Gas，需要自行解析
	return 20
}

func (p *provePrecompile) Run(input []byte) ([]byte, error) {
	if len(input) < 10 { // 确保至少有两个长度前缀和一些数据
		return nil, errProve
	}

	offset := 0

	// 解析 c 和 d 的长度
	cLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2
	dLen := int(input[offset])<<8 | int(input[offset+1])
	offset += 2

	// 确保输入数据足够长以包含 c, d, n, t, k
	if len(input) < offset+cLen+dLen+3*32 {
		return nil, errProve
	}

	// 解析 c 和 d
	c := input[offset : offset+cLen]
	offset += cLen
	d := input[offset : offset+dLen]
	offset += dLen

	// 解析 n, t, k
	nBytes := input[offset : offset+32]
	offset += 32
	tBytes := input[offset : offset+32]
	offset += 32
	kBytes := input[offset : offset+32]
	offset += 32

	nBig := new(big.Int).SetBytes(nBytes)
	tBig := new(big.Int).SetBytes(tBytes)
	kBig := new(big.Int).SetBytes(kBytes)
	// 将字节数据转换为大数和整数

	tInt := int(tBig.Int64())
	kInt := int(kBig.Int64())

	// 调用 prove 函数
	cs, vs := prove(c, d, nBig, uint(tInt), kInt)
	return append(cs, vs...), nil
}
