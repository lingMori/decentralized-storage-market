package PoS

import (
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"
	"testing"
)

// // exp* gets setup in test.go
// var prover *Prover = nil
// var verifier *Verifier = nil
// var pk []byte
// var index int64 = 3
// var size int64 = 0
// var beta int = 30
// var graphDir string = "Xi"
// var name string = "G"
//
//	func TestPoS(t *testing.T) {
//		//seed := make([]byte, 64)
//		seed := []byte{211, 235, 5, 101, 140, 84, 244, 89, 197, 165, 155, 171, 154, 60, 31, 164, 252, 224, 49, 106, 204, 108, 193, 179, 190, 143, 100, 159, 1, 189, 143, 25, 26, 125, 93, 194, 72, 134, 216, 160, 106, 132, 150, 200, 207, 24, 148, 82, 3, 165, 208, 207, 24, 228, 193, 94, 55, 21, 62, 79, 189, 180, 232, 23}
//		fmt.Println("seed: ", seed)
//		challenges := verifier.SelectChallenges(seed)
//		now := time.Now()
//		hashes, parents, proofs, pProofs := prover.ProveSpace(challenges)
//		fmt.Printf("Prove: %f\n", time.Since(now).Seconds())
//		fmt.Println("challenges: ", challenges)
//		fmt.Println("hashes: ", hashes)
//		fmt.Println("parents: ", parents)
//		fmt.Println("proofs: ", proofs)
//		fmt.Println("pProofs: ", pProofs)
//
//		fmt.Println("verifier pk: ", verifier.pk)
//		fmt.Println("verifier index: ", verifier.index)
//		fmt.Println("verifier beta: ", verifier.beta)
//		fmt.Println("verifier root: ", verifier.root)
//
//		now = time.Now()
//		if !verifier.VerifySpace(challenges, hashes, parents, proofs, pProofs) {
//			log.Fatal("Verify space failed:", challenges)
//		}
//		fmt.Printf("Verify: %f\n", time.Since(now).Seconds())
//	}
//
//	func TestMain(m *testing.M) {
//		size = numXi(index)
//		pk = []byte{1}
//
//		runtime.GOMAXPROCS(runtime.NumCPU())
//
//		id := flag.Int("index", 1, "graph index")
//		flag.Parse()
//		index = int64(*id)
//
//		graphDir = fmt.Sprintf("%s%d", graphDir, *id)
//		//os.RemoveAll(graphDir)
//
//		now := time.Now()
//		prover = NewProver(pk, index, name, graphDir)
//		fmt.Printf("%d. Graph gen: %fs\n", index, time.Since(now).Seconds())
//
//		now = time.Now()
//		commit := prover.Init()
//		fmt.Printf("%d. Graph commit: %fs\n", index, time.Since(now).Seconds())
//
//		root := commit.Commit
//		verifier = NewVerifier(pk, index, beta, root)
//		code := m.Run()
//		os.Exit(code)
//	}
func formatIntSlice(slice []int64) string {
	return strings.Trim(strings.Join(strings.Fields(fmt.Sprint(slice)), ","), "[]")
}

func formatByteSlices(slices [][]byte) []string {
	var result []string
	for _, slice := range slices {
		result = append(result, fmt.Sprintf("%x", slice))
	}
	return result
}

func TestPoS(t *testing.T) {
	//pk := []byte{1}
	pk := []byte{
		0x9C, 0x46, 0x3f, 0x57, 0x81, 0xC2, 0x94, 0x0a,
		0x5D, 0xc8, 0xEC, 0xB3, 0xA0, 0x21, 0xdd, 0x60,
		0xa3, 0xC0, 0x10, 0x95,
	}
	cmd1 := exec.Command("python3", "related.py", "set_address", "0x614a15C5B8962Be8F8ec99c002E97a6B550566Ac")

	out1, err := cmd1.CombinedOutput()
	if err != nil {
		fmt.Printf("cmd.Run() failed with %s\n", err)
	}

	fmt.Printf("combined out:\n%s\n", string(out1))

	index := int64(1)
	beta, root := Initialize(index, pk)
	log.Println("pk", formatForEthereumForbytes(pk))
	log.Println("index", index)
	log.Println("beta", beta)
	log.Println("root", formatForEthereumForbytes(root))
	log.Println("Initialization completed.")

	cmd2 := exec.Command("python3", "related.py", "send_set_proof_transaction", formatForEthereumForbytes(pk), strconv.FormatInt(index, 10), strconv.Itoa(beta), formatForEthereumForbytes(root), "200")

	out2, err := cmd2.CombinedOutput()
	if err != nil {
		fmt.Printf("cmd.Run() failed with %s\n", err)
	}

	fmt.Printf("combined out:\n%s\n", string(out2))

	// 生成挑战种子
	seed := []byte{211, 235, 5, 101, 140, 84, 244, 89, 197, 165, 155, 171, 154, 60, 31, 164, 252, 224, 49, 106, 204, 108, 193, 179, 190, 143, 100, 159, 1, 189, 143, 25, 26, 125, 93, 194, 72, 134, 216, 160, 106, 132, 150, 200, 207, 24, 148, 82, 3, 165, 208, 207, 24, 228, 193, 94, 55, 21, 62, 79, 189, 180, 232, 23}

	// 证明
	challenges, hashes, parents, proofs, pProofs := Prove(seed)
	log.Println("challenges", formatSliceForints64(challenges))
	log.Println("hashes", formatHex(fmt.Sprint(hashes)))
	log.Println("parents", formatHex(fmt.Sprint(parents)))
	log.Println("proofs", formatHex(fmt.Sprint(proofs)))
	log.Println("pProofs", formatHex(fmt.Sprint(pProofs)))
	log.Println("Proof completed.")

	// 转换为字符串格式
	challengesStr := formatIntSlice(challenges)
	cmd3 := exec.Command("python3", "related.py", "send_verify_space_transaction", challengesStr, formatHex(fmt.Sprint(hashes)), formatHex(fmt.Sprint(parents)), formatHex(fmt.Sprint(proofs)), formatHex(fmt.Sprint(pProofs)))
	out3, err := cmd3.CombinedOutput()
	if err != nil {
		fmt.Printf("cmd.Run() failed with %s\n", err)
	}

	fmt.Printf("combined out:\n%s\n", string(out3))

	// 验证
	isValid := Verify(challenges, hashes, parents, proofs, pProofs)

	if isValid {
		log.Println("Verification successful!")
	} else {
		log.Println("Verification failed.")
	}
}
