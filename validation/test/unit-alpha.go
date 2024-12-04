package test

import "fmt"

type User struct {
	name      string
	id        uint32
	nodesList *[]*Node
}

type Node struct {
	nodeId      string
	nodeBalance uint32
}

func (*User) InitNodesList() {
	var user = new(User)
	user.id = 1
	user.name = "shirozhang"
	user.nodesList = new([]*Node)

	*user.nodesList = append(*user.nodesList, &Node{"1", 1})
	*user.nodesList = append(*user.nodesList, &Node{"2", 2})
	*user.nodesList = append(*user.nodesList, &Node{"3", 3})

	for _, v := range *user.nodesList {
		fmt.Println(v.nodeId, v.nodeBalance)
	}
}

// export a func to support test
func UintTest() {
	sliceAppend()

	var user = new(User)
	user.InitNodesList()

}

func sliceAppend() {
	slSmall := []int{1, 2, 3}
	slLarge := make([]int, 10)

	cpyElementNum := copy(slLarge, slSmall)
	fmt.Println("slice append", slLarge, cpyElementNum)
	fmt.Printf("\033[7;31;40m%s\033[0m\n", "asdasd")
}
