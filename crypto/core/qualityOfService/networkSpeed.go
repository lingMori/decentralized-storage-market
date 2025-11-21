package qualityOfService

import (
	"github.com/showwin/speedtest-go/speedtest"
)

// SpeedTestService is the RPC service that provides network speed tests.
type SpeedTestService struct{}

// SpeedTestResult holds the results of a speed test.
type SpeedTestResult struct {
	Latency  string
	Download float64
	Upload   float64
}

// NetworkSpeedResponse wraps the results of the network speed test for RPC response.
type NetworkSpeedResponse struct {
	Results []SpeedTestResult
}

// NetworkSpeed performs speed tests and returns the results.
func (s *SpeedTestService) NetworkSpeed(args interface{}, reply *NetworkSpeedResponse) error {
	var speedtestClient = speedtest.New()
	serverList, err := speedtestClient.FetchServers()
	if err != nil {
		return err
	}

	targets, err := serverList.FindServer([]int{})
	if err != nil {
		return err
	}

	for _, s := range targets {
		s.PingTest(nil)
		s.DownloadTest()
		s.UploadTest()
		result := SpeedTestResult{
			Latency:  s.Latency.String(),
			Download: s.DLSpeed,
			Upload:   s.ULSpeed,
		}
		reply.Results = append(reply.Results, result)
		s.Context.Reset() // reset counter
	}

	return nil
}
