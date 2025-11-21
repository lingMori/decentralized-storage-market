package PoST

import (
	"bytes"
	"crypto/rand"
	"crypto/sha256"
	"fmt"
	"io"
	"math/big"
	"os"
)

const Mysha3Size = 224

func Mysha3(data []byte) []byte {
	h := sha256.New224()
	h.Write(data)
	return h.Sum(nil)
}

func hmac(key []byte, data []byte) []byte {
	h := sha256.New()
	h.Write(key)
	h.Write(data)
	return h.Sum(nil)
}

func Setup(nBits int) (*big.Int, *big.Int) {
	p, _ := rand.Prime(rand.Reader, nBits/2)
	q, _ := rand.Prime(rand.Reader, nBits/2)
	return p, q
}

func evalTrap(x []byte, n *big.Int, e *big.Int) []byte {
	xInt := new(big.Int).SetBytes(x)
	r := new(big.Int).Exp(xInt, e, n)
	return r.Bytes()
}

func eval(x []byte, n *big.Int, t uint) []byte {
	g := new(big.Int).SetBytes(x)
	exp := new(big.Int).SetUint64(1 << t)
	result := new(big.Int).Exp(g, exp, n)
	return result.Bytes()
}

// 使用陷门排列store生成并存储数据的身份验证信息
func store(c []byte, d []byte, p *big.Int, q *big.Int, t int, k int) ([]byte, []byte) {
	one := big.NewInt(1)
	n := new(big.Int).Mul(p, q)
	phi := new(big.Int).Mul(new(big.Int).Sub(p, one), new(big.Int).Sub(q, one))
	e := new(big.Int).Exp(big.NewInt(2), big.NewInt(int64(t)), nil)
	e.Mod(e, phi)

	var cs, vs []byte
	//迭代k次
	for i := 0; i <= k; i++ {
		//fmt.Printf("store 迭代次数:%d\n", i)
		//计算文件的hmac
		v := hmac(c, d)
		//appends c to the cs byte slice and v to the vs byte slice.
		cs = append(cs, c...)
		vs = append(vs, v...)
		//
		c = Mysha3(evalTrap(Mysha3(v), n, e))
		//fmt.Printf("已经进行了%d轮\n", i)
	}
	return Mysha3(cs), Mysha3(vs)
}

// 使用 Store 函数生成的身份验证信息为给定文件 d 生成真实性证明
func prove(c []byte, d []byte, n *big.Int, t uint, k int) ([]byte, []byte) {
	var cs, vs []byte
	for i := 0; i <= k; i++ {
		//fmt.Printf("prove 迭代次数:%d\n", i)
		v := hmac(c, d)
		cs = append(cs, c...)
		vs = append(vs, v...)
		c = Mysha3(eval(Mysha3(v), n, t))
		//fmt.Printf("已经进行了%d轮\n", i)
	}
	return Mysha3(cs), Mysha3(vs)
}

func verify(c []byte, b []byte, a []byte, n *big.Int, t uint) bool {
	// Calculate the number of iterations
	k := len(a)/(Mysha3Size+int(t/8)) - 1

	// Recompute c from b and d
	d := make([]byte, len(c)+len(a))
	copy(d, c)
	copy(d[len(c):], a)
	cRecomputed := Mysha3(d)

	// Recompute v from b and d
	v := make([]byte, 0, Mysha3Size*(k+1))
	for i := 0; i <= k; i++ {
		offset := len(c) + i*(Mysha3Size+int(t/8))
		v = append(v, b[offset:offset+Mysha3Size]...)
	}
	vRecomputed := Mysha3(v)

	// Verify the commitments
	if !bytes.Equal(c, cRecomputed) {
		return false
	}

	// Verify the challenge values
	if !bytes.Equal(v, vRecomputed) {
		return false
	}

	// Verify the responses
	for i := 0; i <= k; i++ {
		offset := len(c) + i*(Mysha3Size+int(t/8))
		r := new(big.Int).SetBytes(a[offset : offset+int(t/8)])
		x := new(big.Int).SetBytes(a[offset+int(t/8) : offset+Mysha3Size+int(t/8)])
		fx := evalTrap(x.Bytes(), n, big.NewInt(int64(t)))
		ax := new(big.Int).SetBytes(fx)
		gx := new(big.Int).Exp(ax, r, n)
		//gx  := new(big.Int).Exp(new(big.Int).SetBytes(fx), r, n)
		if !bytes.Equal(x.Bytes(), Mysha3(gx.Bytes())) {
			return false
		}
	}

	return true
}

func getHash() string {
	file, err := os.Open("random.txt")
	if err != nil {
		fmt.Println("Error opening file:", err)
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		fmt.Println("Error calculating file hash:", err)
	}

	fmt.Printf("File hash: %x\n", hash.Sum(nil))
	return fmt.Sprintf("%x", hash.Sum(nil))
}
