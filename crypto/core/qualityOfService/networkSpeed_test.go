package qualityOfService

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"net/rpc"
	"testing"
)

func TestService(t *testing.T) {
	speedTestService := new(SpeedTestService)
	rpc.Register(speedTestService)
	rpc.HandleHTTP()

	listener, err := net.Listen("tcp", ":1234") // Choose a port that suits your setup
	if err != nil {
		fmt.Println("Listen error:", err)
		return
	}

	fmt.Println("Serving RPC server on port 1234")
	http.Serve(listener, nil)
}

func TestClinet(t *testing.T) {
	client, err := rpc.DialHTTP("tcp", "localhost:1234") // Replace with actual server address
	if err != nil {
		log.Fatal("Dialing:", err)
	}

	var reply NetworkSpeedResponse
	err = client.Call("SpeedTestService.NetworkSpeed", new(interface{}), &reply)
	if err != nil {
		log.Fatal("Speed test error:", err)
	}

	for _, result := range reply.Results {
		fmt.Printf("Latency: %s, Download: %f Mbps, Upload: %f Mbps\n", result.Latency, result.Download, result.Upload)
	}
}
