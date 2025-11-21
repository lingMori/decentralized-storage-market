package PoS

import (
	"encoding/hex"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"
)

var prover *Prover = nil
var verifier *Verifier = nil
var pk []byte
var index int64 = 3
var size int64 = 0
var beta int = 30
var graphDir string = "Xi"
var name string = "G"

// Initialize initializes the prover and verifier.
func Initialize(index int64, pk []byte) (int, []byte) {
	size = numXi(index)

	graphDir = fmt.Sprintf("%s%d", graphDir, index)

	now := time.Now()
	prover = NewProver(pk, index, name, graphDir)
	fmt.Printf("%d. Graph gen: %fs\n", index, time.Since(now).Seconds())

	now = time.Now()
	commit := prover.Init()
	fmt.Printf("%d. Graph commit: %fs\n", index, time.Since(now).Seconds())

	root := commit.Commit
	verifier = NewVerifier(pk, index, beta, root)
	return verifier.beta, verifier.root
}

// Prove returns proof for the given challenges.
func Prove(seed []byte) ([]int64, [][]byte, [][][]byte, [][][]byte, [][][][]byte) { // Modify the return types accordingly
	challenges := verifier.SelectChallenges(seed)

	now := time.Now()
	hashes, parents, proofs, pProofs := prover.ProveSpace(challenges)
	fmt.Printf("Prove: %f\n", time.Since(now).Seconds())

	return challenges, hashes, parents, proofs, pProofs
}

// Verify checks if the provided proofs are valid.
func Verify(challenges []int64, hashes [][]byte, parents [][][]byte, proofs [][][]byte, pProofs [][][][]byte) bool { // Modify the input types accordingly
	now := time.Now()
	valid := verifier.VerifySpace(challenges, hashes, parents, proofs, pProofs)
	if !valid {
		log.Fatal("Verify space failed:", challenges)
	}
	fmt.Printf("Verify: %f\n", time.Since(now).Seconds())

	return valid
}

func formatForEthereumForbytes(data []byte) string {
	return "0x" + hex.EncodeToString(data)
}

// 整数数组打印
func formatSliceForints(slice []int) string {
	strs := make([]string, len(slice))
	for i, v := range slice {
		strs[i] = fmt.Sprintf("%d", v)
	}
	return "[" + strings.Join(strs, ", ") + "]"
}

// 整数数组打印
func formatSliceForints64(slice []int64) string {
	strs := make([]string, len(slice))
	for i, v := range slice {
		strs[i] = fmt.Sprintf("%d", v)
	}
	return "[" + strings.Join(strs, ", ") + "]"
}

func formatHex(inputStr string) string {
	re := regexp.MustCompile(`\[\d+(?: \d+)*\]`)
	formattedStr := re.ReplaceAllStringFunc(inputStr, replaceToHex)
	return strings.ReplaceAll(formattedStr, " ", ",")
}

func replaceToHex(match string) string {
	bytesArray := strings.Fields(match[1 : len(match)-1]) // 去除外部的[]
	var hexStr strings.Builder
	hexStr.WriteString("0x")
	for _, byteValue := range bytesArray {
		var num int
		fmt.Sscanf(byteValue, "%d", &num)
		hexStr.WriteString(fmt.Sprintf("%02x", num))
	}
	return "\"" + hexStr.String() + "\""
}
