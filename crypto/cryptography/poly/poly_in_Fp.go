package tmps

import (
	"fmt"
	"math/big"
)

// Polynomial 结构表示多项式，包括系数和有限域 GF(p) 中的素数 p。
type Polynomial struct {
	coefficients []*big.Int // 多项式的系数，从最高次项到最低次项
	prime        *big.Int   // 有限域 GF(p) 中的素数 p
}

// NewPolynomial 创建一个新的多项式对象。
func NewPolynomial(coefficients []*big.Int, prime *big.Int) *Polynomial {
	return &Polynomial{coefficients, prime}
}

// 返回coefficients
func (p *Polynomial) GetCoefficients() []*big.Int {
	return p.coefficients
}

// Add 执行多项式加法操作。
func (p *Polynomial) Add(q *Polynomial) *Polynomial {
	maxLen := len(p.coefficients)
	if len(q.coefficients) > maxLen {
		maxLen = len(q.coefficients)
	}

	resultCoefficients := make([]*big.Int, maxLen)

	for i := 0; i < maxLen; i++ {
		coeffP := big.NewInt(0)
		coeffQ := big.NewInt(0)

		if i < len(p.coefficients) {
			coeffP.Set(p.coefficients[i])
		}
		if i < len(q.coefficients) {
			coeffQ.Set(q.coefficients[i])
		}

		resultCoefficients[i] = new(big.Int)
		resultCoefficients[i].Add(coeffP, coeffQ)
		resultCoefficients[i].Mod(resultCoefficients[i], p.prime)
	}

	return &Polynomial{resultCoefficients, p.prime}
}

// Subtract 执行多项式减法操作。
func (p *Polynomial) Subtract(q *Polynomial) *Polynomial {
	maxLen := len(p.coefficients)
	if len(q.coefficients) > maxLen {
		maxLen = len(q.coefficients)
	}

	resultCoefficients := make([]*big.Int, maxLen)

	for i := 0; i < maxLen; i++ {
		coeffP := big.NewInt(0)
		coeffQ := big.NewInt(0)

		if i < len(p.coefficients) {
			coeffP.Set(p.coefficients[i])
		}
		if i < len(q.coefficients) {
			coeffQ.Set(q.coefficients[i])
		}

		resultCoefficients[i] = new(big.Int)
		resultCoefficients[i].Sub(coeffP, coeffQ)
		resultCoefficients[i].Add(resultCoefficients[i], p.prime)
		resultCoefficients[i].Mod(resultCoefficients[i], p.prime)
	}

	return &Polynomial{resultCoefficients, p.prime}
}

// Multiply 执行多项式乘法操作。
func (p *Polynomial) Multiply(q *Polynomial) *Polynomial {
	prime := p.prime
	degP := p.Degree()
	degQ := q.Degree()

	resultCoefficients := make([]*big.Int, degP+degQ+1)
	for k := 0; k <= degP+degQ; k++ {
		resultCoefficients[k] = big.NewInt(0)
	}

	for i := 0; i <= degP; i++ {
		for j := 0; j <= degQ; j++ {
			coeffP := new(big.Int).Set(p.coefficients[i])
			coeffQ := new(big.Int).Set(q.coefficients[j])

			product := new(big.Int).Mul(coeffP, coeffQ)
			resultCoefficients[i+j].Add(resultCoefficients[i+j], product)
			resultCoefficients[i+j].Mod(resultCoefficients[i+j], prime)
		}
	}

	return &Polynomial{resultCoefficients, prime}
}

// String 返回多项式的字符串表示。
func (p *Polynomial) String() string {
	result := ""
	for i := len(p.coefficients) - 1; i >= 0; i-- {
		coeff := p.coefficients[i]
		if coeff.Cmp(big.NewInt(0)) != 0 {
			if result != "" {
				result += " + "
			}
			if i == 0 || coeff.Cmp(big.NewInt(1)) != 0 {
				result += coeff.String()
			}
			if i > 0 {
				result += fmt.Sprintf("x^%d", i)
			}
		}
	}
	return result
}

// Degree 返回多项式的最高次项次数。
func (p *Polynomial) Degree() int {
	for i := 0; i < len(p.coefficients); i++ { // 从数组的第一项开始遍历
		if p.coefficients[i].Cmp(big.NewInt(0)) != 0 {
			return len(p.coefficients) - 1 - i // 返回实际的最高次项次数
		}
	}
	return -1 // 多项式为零多项式
}

// Evaluate 在有限域 Fp 上计算多项式在 x0 处的值。
func (p *Polynomial) Evaluate(x0 *big.Int) *big.Int {
	result := new(big.Int)

	for i := len(p.coefficients) - 1; i >= 0; i-- {
		term := new(big.Int).Set(p.coefficients[i])
		x0Power := new(big.Int).Exp(x0, big.NewInt(int64(i)), p.prime)
		term.Mul(term, x0Power)
		result.Add(result, term)
		result.Mod(result, p.prime)
	}

	return result
}

func (M *Polynomial) Divide(P *Polynomial) (*Polynomial, *Polynomial) {
	// 检查是否尝试除以零多项式
	if P.Degree() == -1 {
		panic("Division by zero polynomial is not allowed")
	}

	// 获取M和P的度数
	degreeM := M.Degree()
	degreeP := P.Degree()

	// 如果M的度数小于P的度数，返回零多项式作为商，M作为余数
	if degreeM < degreeP {
		return NewPolynomial([]*big.Int{big.NewInt(0)}, M.prime), M
	}

	// 初始化商的系数数组
	quotientCoefficients := make([]*big.Int, degreeM-degreeP+1)
	for q := range quotientCoefficients {
		quotientCoefficients[q] = big.NewInt(0)
	}

	// 创建余数多项式
	remainderCoefficients := make([]*big.Int, len(M.coefficients))
	for i, v := range M.coefficients {
		remainderCoefficients[i] = new(big.Int).Set(v)
	}
	remainder := NewPolynomial(remainderCoefficients, M.prime)

	// 计算P最高次项的模逆
	inverse := new(big.Int).ModInverse(P.coefficients[0], M.prime)

	// 当前商系数应放置的位置，从最高次往最低次放
	position := 0

	// 循环直到余数的度数小于P的度数
	for degreeM >= degreeP {
		// 计算当前商的系数（最高次项）
		leadingCoefficient := new(big.Int).Set(remainder.coefficients[0])
		leadingCoefficient.Mul(leadingCoefficient, inverse)
		leadingCoefficient.Mod(leadingCoefficient, M.prime)

		// 更新商的系数，按顺序放置
		quotientCoefficients[position] = leadingCoefficient
		position++

		// 更新余数
		for i := 0; i <= degreeP; i++ {
			tmp := new(big.Int).Mul(leadingCoefficient, P.coefficients[i])
			tmp.Mod(tmp, M.prime)
			remainder.coefficients[i].Sub(remainder.coefficients[i], tmp)
			remainder.coefficients[i].Mod(remainder.coefficients[i], M.prime)
		}

		// 去掉最高次项
		remainder.coefficients = remainder.coefficients[1:]

		// 重新计算余数的度数
		degreeM = remainder.Degree()
	}

	// 清除商中的前导零系数
	i := 0
	for i < len(quotientCoefficients) && quotientCoefficients[i].Cmp(big.NewInt(0)) == 0 {
		i++
	}
	quotientCoefficients = quotientCoefficients[i:]

	// 清除余数中的前导零系数
	i = 0
	for i < len(remainder.coefficients) && remainder.coefficients[i].Cmp(big.NewInt(0)) == 0 {
		i++
	}
	remainder.coefficients = remainder.coefficients[i:]

	// 创建并返回商和余数的多项式对象
	quotient := NewPolynomial(quotientCoefficients, M.prime)
	return quotient, remainder

}
