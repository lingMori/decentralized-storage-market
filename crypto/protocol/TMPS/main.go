package main

import (
	bn256 "github.com/ethereum/go-ethereum/crypto/bn256/cloudflare"
	"github.com/sirupsen/logrus"
	"github.com/timecool-cpu/offchain-storage/protocol/TMPS/tmps"
	"math/big"
	"time"
)

func main() {
	// 设置日志级别
	logrus.SetLevel(logrus.InfoLevel)
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	// 文件数
	N := 2
	// 多项式次数数组
	degrees := []int{100, 300, 10, 20, 30, 40}

	for _, d := range degrees {
		logrus.Infof("Starting setup for polynomial degree: %d", d)

		// 初始化多项式 bf_M
		bf_M := tmps.NewPolynomial(tmps.GenerateRandomBigIntArray(tmps.Prime, d), tmps.Prime)
		totalBytes := 0
		for _, coeff := range bf_M.GetCoefficients() {
			totalBytes += len(coeff.Bytes())
		}
		logrus.WithFields(logrus.Fields{
			"degree":    d,
			"bf_M_size": totalBytes,
		}).Info("bf_M generated")
		// Setup 阶段
		startSetup := time.Now()
		com := tmps.SetupCommon(d, N)
		pk, ek := tmps.Setup(bf_M, com)
		logrus.WithFields(logrus.Fields{
			"degree":     d,
			"setup_time": time.Since(startSetup),
		}).Info("Setup completed")

		// Chal 阶段
		startChal := time.Now()
		chal := tmps.GenerateChallenges("challenge", N)
		challenge, vk := tmps.Chal(pk, chal)
		logrus.WithFields(logrus.Fields{
			"degree":    d,
			"chal_time": time.Since(startChal),
		}).Info("Challenge generated")

		helper(pk)

		// Prove 阶段
		startProve := time.Now()
		pi := tmps.Prove(challenge, ek)
		logrus.WithFields(logrus.Fields{
			"degree":     d,
			"prove_time": time.Since(startProve),
		}).Info("Proof generated")

		// Verify 阶段
		startVerify := time.Now()
		b := tmps.Verify(pk, challenge, pi, vk)
		logrus.WithFields(logrus.Fields{
			"degree":      d,
			"verify_time": time.Since(startVerify),
			"result":      b,
		}).Info("Verification completed")

		// 聚合和验证
		logrus.Info("Starting aggregation...")
		startAgg := time.Now()

		bf_N := tmps.NewPolynomial(tmps.GenerateRandomBigIntArray(tmps.Prime, d), tmps.Prime)
		pk1, ek1 := tmps.Setup(bf_N, com)
		_, vk1 := tmps.Chal(pk1, chal)
		pi1 := tmps.Prove(challenge, ek1)

		startAggress := time.Now()
		pi_a, vk_a := tmps.Aggregation([]*tmps.Pi{pi, pi1}, []*tmps.Vk{vk, vk1})
		aggresTime := time.Since(startAggress)

		startAggVerify := time.Now()
		b_a := tmps.Verify(pk, challenge, pi_a, vk_a)
		aggVerifyTime := time.Since(startAggVerify)

		logrus.WithFields(logrus.Fields{
			"degree":            d,
			"aggregation_time":  time.Since(startAgg),
			"agg_time":          aggresTime,
			"agg_verify_time":   aggVerifyTime,
			"agg_verify_result": b_a,
		}).Info("Aggregation and verification completed")

		logrus.Info("------------------------------------------------")
	}
}

func helper(pk *tmps.Pk) {
	//计算g1的5次方
	g1_5 := tmps.OneG1().ScalarMult(pk.GetG1(), big.NewInt(5))
	g2_9 := tmps.OneG2().ScalarMult(pk.GetG2(), big.NewInt(9))
	g1_6 := tmps.OneG1().ScalarMult(pk.GetG1(), big.NewInt(6))
	g2_8 := tmps.OneG2().ScalarMult(pk.GetG2(), big.NewInt(8))
	tmps.PrintG1(g1_5, "g1^5")
	tmps.PrintG2(g2_9, "g2^9")
	tmps.PrintG1(g1_6, "g1^6")
	tmps.PrintG2(g2_8, "g2^8")
	p1_37 := bn256.Pair(pk.GetG1(), new(bn256.G2).ScalarMult(pk.GetG2(), big.NewInt(37)))
	p5_9 := bn256.Pair(g1_5, g2_9)
	p6_8 := bn256.Pair(g1_6, g2_8)
	p1_9 := bn256.Pair(tmps.OneG1(), g2_9)
	tmps.PrintGT(p1_37, "e(g1,g2)^37")
	tmps.PrintGT(p5_9, "e(g1^5,g2^9)")
	tmps.PrintGT(p6_8, "e(g1^6,g2^8)")
	tmps.PrintGT(p1_9, "e(1,g2^9)")
	p1_102 := bn256.Pair(pk.GetG1(), new(bn256.G2).ScalarMult(pk.GetG2(), big.NewInt(102)))
	tmps.PrintGT(p1_102, "e(g1,g2)^102")
}
