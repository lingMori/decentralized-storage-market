package core

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"github.com/ipfs/go-cid"
	shell "github.com/ipfs/go-ipfs-api"
	"io"
	"os"
	"path/filepath"
)

// 定义一个文件信息的结构体
type FileInfo struct {
	Name      string
	Size      int64
	Path      string
	IsSymlink bool
	Cid       cid.Cid
	md5       string
}

// getFileMD5Hash 读取一个文件并返回它的 MD5 哈希值。
func getFileMD5Hash(filePath string) (string, error) {
	// 打开文件
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 创建一个 md5 哈希值对象
	hash := md5.New()

	// 将文件的内容复制到哈希值对象中
	// io.Copy 将会读取 file 的每一部分并将其写入到 hash 中，直到没有更多的数据或者遇到错误
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	// 计算最终的哈希值并将其转换为字符串
	hashInBytes := hash.Sum(nil)
	hashInStr := hex.EncodeToString(hashInBytes)

	return hashInStr, nil
}

// 检查文件路径并返回文件信息
func GetFileInfo(path string) (*FileInfo, error) {
	// 获取绝对路径
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	// 清理路径
	absPath = filepath.Clean(absPath)

	// 获取文件状态信息，使用Lstat不会对软链接进行解引用，可以检查路径是否是软链接
	stat, err := os.Lstat(absPath)
	if err != nil {
		return nil, err
	}

	// 检查路径是否是软链接
	isSymlink := false
	if stat.Mode()&os.ModeSymlink != 0 {
		isSymlink = true
	}

	// 如果路径是软链接，获取软链接指向的文件或目录的状态信息
	if isSymlink {
		stat, err = os.Stat(absPath)
		if err != nil {
			return nil, err
		}
	}

	// 检查路径是否指向一个文件
	if stat.IsDir() {
		return nil, errors.New("路径必须指向一个文件")
	}

	// 获取文件名和大小
	fileName := stat.Name()
	fileSize := stat.Size()

	// 创建一个文件信息对象并返回
	return &FileInfo{
		Name:      fileName,
		Size:      fileSize,
		Path:      absPath,
		IsSymlink: isSymlink,
	}, nil
}

func getFileCID(path string) (string, error) {
	// 创建一个IPFS shell
	sh := shell.NewShell("localhost:5001")

	// 打开文件
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 添加文件到IPFS，但是只计算CID
	cid, err := sh.Add(file, shell.OnlyHash(true))

	if err != nil {
		return "", err
	}

	return cid, nil
}
