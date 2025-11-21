package qualityOfService

import (
	"strings"
	"testing"
)

func TestPing(t *testing.T) {
	duration, output, err := Ping("baidu.com", 1)
	if err != nil {
		t.Fatalf("Ping returned an error: %v", err)
	}
	if duration == 0 {
		t.Error("Ping returned a zero duration")
	}
	if !strings.Contains(output, "baidu.com") {
		t.Errorf("Ping output does not contain the domain name: %s", output)
	}
	//打印duration,单位ms
	t.Logf("Ping duration: %d ms", duration)
}
