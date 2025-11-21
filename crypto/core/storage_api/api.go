package api

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
)

func store(localFilePath string) {
	// 读取配置文件
	config, err := readConfig("./config.json")
	if err != nil {
		fmt.Println("读取配置文件失败:", err)
		return
	}

	cid, err := CalculateFileCID(localFilePath)
	if err != nil {
		fmt.Println("计算文件CID失败:", err)
	} else {
		fmt.Println("文件CID:", cid)
	}

	// 创建以 cid 命名的文件夹
	dirPath := fmt.Sprintf("%s", cid)

	// 先判断目录是否已存在
	if _, err := os.Stat(dirPath); err == nil {
		fmt.Printf("Directory already exists: %s; skipping creation.\n", dirPath)
	} else if !os.IsNotExist(err) {
		fmt.Printf("Error checking directory existence: %v\n", err)
		return
	} else {
		// 目录不存在，创建新目录
		err = os.Mkdir(dirPath, 0755)
		if err != nil {
			fmt.Printf("Failed to create directory: %v\n", err)
			return
		}
	}

	// 原文件路径已保存在 localFilePath 变量中
	dstFilePath := fmt.Sprintf("%s/%s", dirPath, filepath.Base(localFilePath))
	// 打开源文件
	srcFile, err := os.Open(localFilePath)
	if err != nil {
		fmt.Printf("Failed to open source file: %v\n", err)
		return
	}
	defer srcFile.Close()

	// 创建目标文件
	dstFile, err := os.Create(dstFilePath)
	if err != nil {
		fmt.Printf("Failed to create destination file: %v\n", err)
		return
	}
	defer dstFile.Close()

	// 复制文件内容
	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		fmt.Printf("Failed to copy file contents: %v\n", err)
		return
	}

	fmt.Printf("Successfully copied file from %s to %s\n", localFilePath, dstFilePath)

	// 确认文件已移动到新目录
	_, err = ioutil.ReadFile(dstFilePath)
	if err != nil {
		fmt.Printf("Failed to read moved file: %v\n", err)
		return
	}

	dstFilePath = fmt.Sprintf("%s", dirPath)
	err = uploadFileToRemote(dstFilePath, config)
	if err != nil {
		fmt.Println(err)
	}
}
