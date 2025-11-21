package core

import "net/http"

// HttpApi implements github.com/ipfs/interface-go-ipfs-core/CoreAPI using
// IPFS HTTP API.
//
// For interface docs see
// https://godoc.org/github.com/ipfs/interface-go-ipfs-core#CoreAPI
type HttpApi struct {
	url     string
	httpcli http.Client
	Headers http.Header
}

//func (api *HttpApi) Request(command string, args ...string) RequestBuilder {
//	headers := make(map[string]string)
//	if api.Headers != nil {
//		for k := range api.Headers {
//			headers[k] = api.Headers.Get(k)
//		}
//	}
//	return &requestBuilder{
//		command: command,
//		args:    args,
//		shell:   api,
//		headers: headers,
//	}
//}
