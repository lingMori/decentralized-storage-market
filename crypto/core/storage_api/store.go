package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os/exec"
)

// Config 结构体用来映射配置文件中的参数
type Config struct {
	RemoteUser string `json:"remoteUser"`
	RemoteHost string `json:"remoteHost"`
	RemotePort int    `json:"remotePort"`
	RemotePath string `json:"remotePath"`
	Password   string `json:"password"`
}

// 从配置文件中读取配置
func readConfig(path string) (Config, error) {
	var config Config
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return config, err
	}
	err = json.Unmarshal(data, &config)
	return config, err
}

func uploadFileToRemote(localFilePath string, config Config) error {
	cmd := exec.Command("sshpass", "-p", config.Password, "scp", "-r", "-P", fmt.Sprintf("%d", config.RemotePort), localFilePath, fmt.Sprintf("%s@%s:%s", config.RemoteUser, config.RemoteHost, config.RemotePath))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("上传文件失败：%v\n%s", err, output)
	}

	fmt.Printf("文件上传成功：%s\n", localFilePath)
	return nil
}
