package api

import (
	"fmt"
	"log"
	"net"
	"net/rpc"
	"os/exec"
)

type Args struct {
	LocalFilePath string
	RemoteUser    string
	RemoteHost    string
	RemotePort    int
	RemotePath    string
	Password      string
}

type FileTransfer int

func (t *FileTransfer) UploadFileToRemote(args *Args, reply *string) error {
	cmd := exec.Command("sshpass", "-p", args.Password, "scp", "-P", fmt.Sprintf("%d", args.RemotePort), args.LocalFilePath, fmt.Sprintf("%s@%s:%s", args.RemoteUser, args.RemoteHost, args.RemotePath))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("上传文件失败：%v\n%s", err, output)
	}

	*reply = fmt.Sprintf("文件上传成功：%s\n", args.LocalFilePath)
	return nil
}

func testRpc() {
	fileTransfer := new(FileTransfer)
	rpc.Register(fileTransfer)
	listener, err := net.Listen("tcp", ":1234")
	if err != nil {
		log.Fatal("ListenTCP error:", err)
	}
	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Fatal("Accept error:", err)
		}
		go rpc.ServeConn(conn)
	}
}
