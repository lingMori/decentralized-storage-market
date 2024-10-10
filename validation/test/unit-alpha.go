package test

import "fmt"

// export a func to support test
func UintTest() {
	sliceAppend()
}

func sliceAppend() {
	slSmall := []int{1, 2, 3}
	slLarge := make([]int, 10)

	cpyElementNum := copy(slLarge, slSmall)
	fmt.Println("slice append", slLarge, cpyElementNum)
}
