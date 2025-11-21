package core

//
//import (
//	"context"
//	"fmt"
//
//	libp2p "github.com/libp2p/go-libp2p"
//	crypto "github.com/libp2p/go-libp2p-core/crypto"
//	network "github.com/libp2p/go-libp2p-core/network"
//	peer "github.com/libp2p/go-libp2p-core/peer"
//)
//
//func handleStream(s network.Stream) {
//	fmt.Println("Got a new stream!")
//
//	// Create a buffer to read the incoming data into.
//	buf := make([]byte, 512)
//	_, err := s.Read(buf)
//	if err != nil {
//		return
//	}
//
//	// Print out the received message.
//	fmt.Println("Received message:", string(buf))
//
//	// Close the stream when we're done.
//	s.Close()
//}
//
//func main2() {
//	// Create a new libp2p Host that listens on a random TCP port.
//	ctx, cancel := context.WithCancel(context.Background())
//	defer cancel()
//
//	// Create a new RSA key pair for this host.
//	priv, _, err := crypto.GenerateKeyPair(crypto.RSA, 2048)
//	if err != nil {
//		panic(err)
//	}
//
//	host, err := libp2p.New(
//		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
//		libp2p.Identity(priv),
//	)
//	if err != nil {
//		panic(err)
//	}
//
//	// Set a protocol as the stream handler.
//	host.SetStreamHandler("/p2p/1.0.0", handleStream)
//
//	fmt.Println("Host created. We are:", host.ID())
//	fmt.Println(host.Addrs())
//
//	// Create a second libp2p Host and connect it to the first.
//	priv2, _, err := crypto.GenerateKeyPair(crypto.RSA, 2048)
//	if err != nil {
//		panic(err)
//	}
//
//	host2, err := libp2p.New(
//		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
//		libp2p.Identity(priv2),
//	)
//	if err != nil {
//		panic(err)
//	}
//
//	// Get the first host's peer info.
//	peerInfo := peer.AddrInfo{
//		ID:    host.ID(),
//		Addrs: host.Addrs(),
//	}
//
//	// Connect the second host to the first.
//	err = host2.Connect(ctx, peerInfo)
//	if err != nil {
//		panic(err)
//	}
//
//	// Open a stream from the second host to the first.
//	s, err := host2.NewStream(ctx, host.ID(), "/p2p/1.0.0")
//	if err != nil {
//		panic(err)
//	}
//
//	// Send a message to the first host.
//	_, err = s.Write([]byte("Hello, world!\n"))
//	if err != nil {
//		panic(err)
//	}
//}
