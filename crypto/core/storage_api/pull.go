package api

import (
	"fmt"
	"os/exec"
)

func downloadFileFromRemote(remoteCID string, localPath string, remoteUser string, remoteHost string, remotePort int, password string) error {
	// 构建 scp 命令
	cmd := exec.Command("sshpass", "-p", password, "scp", "-P", fmt.Sprintf("%d", remotePort), fmt.Sprintf("%s@%s:%s", remoteUser, remoteHost, remoteCID), localPath)

	// 执行命令并获取输出
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("下载文件失败：%v\n%s", err, output)
	}

	fmt.Printf("文件下载成功：%s\n", localPath)
	return nil
}

func testPull() {
	remoteCID := "/home/zhangym/test/hello1" // 使用CID作为远程文件路径
	localPath := "./testdata"                // 本地保存路径
	remoteUser := "zhangym"
	remoteHost := "123.157.213.104"
	remotePort := 22222
	password := "zhangym_123"

	err := downloadFileFromRemote(remoteCID, localPath, remoteUser, remoteHost, remotePort, password)
	if err != nil {
		fmt.Println(err)
	}
}
