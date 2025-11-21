package database

import (
	"context"
	"fmt"
	"github.com/ipfs/kubo/core"
	"github.com/ipfs/kubo/core/node"
	"testing"
)

func TestDatabase(t *testing.T) {
	// 创建IPFS节点
	ctx := context.Background()
	nodeOptions := &node.BuildCfg{
		Online: true,
	}
	node, err := core.NewNode(ctx, nodeOptions)
	if err != nil {
		fmt.Printf("Failed to create IPFS node: %s\n", err)
		return
	}
	defer node.Close()

	// 设置流处理程序
	SetStreamHandler(node, "/my-protocol/1.0.0")

	// 获取本地节点的主机对象
	host := node.PeerHost

	// 连接到目标节点
	targetAddr := "/ip4/目标节点的IP地址/tcp/4001/p2p/目标节点的Peer ID"
	err = connectToPeer(ctx, host, targetAddr)
	if err != nil {
		fmt.Printf("Failed to connect to peer: %s\n", err)
		return
	}

	fmt.Println("Connected to the target peer!")

	// 在连接上发送数据
	err = sendData(host, targetAddr, "Hello, IPFS!")
	if err != nil {
		fmt.Printf("Failed to send data: %s\n", err)
		return
	}

	fmt.Println("Data sent successfully!")

}
