package qualityOfService

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

// Ping 函数执行ping操作并返回延迟时间（毫秒）和可能发生的错误。
func Ping(domain string, count int) (int64, string, error) {
	start := time.Now()
	cmd := exec.Command("ping", domain, fmt.Sprintf("-c %d", count))
	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	duration := time.Since(start)

	if err != nil {
		return 0, "", err
	}

	// 将持续时间转换为毫秒
	durationMs := duration.Milliseconds()

	return durationMs, strings.TrimSpace(out.String()), nil
}
