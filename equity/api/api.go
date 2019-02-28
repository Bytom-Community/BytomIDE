package api

import (
	"crypto/tls"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/kr/secureheader"

	"github.com/bytom/errors"
	"github.com/bytom/net/http/gzip"
	"github.com/bytom/net/http/httpjson"
	"github.com/bytom/netsync"
)

var (
	httpReadTimeout  = 2 * time.Minute
	httpWriteTimeout = time.Hour
)

const (
	// SUCCESS indicates the rpc calling is successful.
	SUCCESS = "success"
	// FAIL indicated the rpc calling is failed.
	FAIL = "fail"
)

// Response describes the response standard.
type Response struct {
	Status      string      `json:"status,omitempty"`
	Code        string      `json:"code,omitempty"`
	Msg         string      `json:"msg,omitempty"`
	ErrorDetail string      `json:"error_detail,omitempty"`
	Data        interface{} `json:"data,omitempty"`
}

//NewSuccessResponse success response
func NewSuccessResponse(data interface{}) Response {
	return Response{Status: SUCCESS, Data: data}
}

//FormatErrResp format error response
func FormatErrResp(err error) (response Response) {
	response = Response{Status: FAIL}
	root := errors.Root(err)
	// Some types cannot be used as map keys, for example slices.
	// If an error's underlying type is one of these, don't panic.
	// Just treat it like any other missing entry.
	defer func() {
		if err := recover(); err != nil {
			response.ErrorDetail = ""
		}
	}()
	if info, ok := respErrFormatter[root]; ok {
		response.Code = info.ChainCode
		response.Msg = info.Message
		response.ErrorDetail = err.Error()

	} else {
		response.Code = respErrFormatter[ErrDefault].ChainCode
		response.Msg = respErrFormatter[ErrDefault].Message
		response.ErrorDetail = err.Error()

	}
	return response
}

//NewErrorResponse error response
func NewErrorResponse(err error) Response {
	response := FormatErrResp(err)
	return response
}

type waitHandler struct {
	h  http.Handler
	wg sync.WaitGroup
}

func (wh *waitHandler) Set(h http.Handler) {
	wh.h = h
	wh.wg.Done()
}

func (wh *waitHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	wh.wg.Wait()
	wh.h.ServeHTTP(w, req)
}

// API is the scheduling center for server
type API struct {
	sync    *netsync.SyncManager
	server  *http.Server
	handler http.Handler
}

func (a *API) initServer() {
	// The waitHandler accepts incoming requests, but blocks until its underlying
	// handler is set, when the second phase is complete.
	var coreHandler waitHandler
	var handler http.Handler

	coreHandler.wg.Add(1)
	mux := http.NewServeMux()
	mux.Handle("/", &coreHandler)

	handler = http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		mux.ServeHTTP(rw, req)
	})
	handler = RedirectHandler(handler)

	secureheader.DefaultConfig.PermitClearLoopback = true
	secureheader.DefaultConfig.HTTPSRedirect = false
	secureheader.DefaultConfig.Next = handler

	a.server = &http.Server{
		// Note: we should not set TLSConfig here;
		// we took care of TLS with the listener in maybeUseTLS.
		Handler:      secureheader.DefaultConfig,
		ReadTimeout:  httpReadTimeout,
		WriteTimeout: httpWriteTimeout,
		// Disable HTTP/2 for now until the Go implementation is more stable.
		// https://github.com/golang/go/issues/16450
		// https://github.com/golang/go/issues/17071
		TLSNextProto: map[string]func(*http.Server, *tls.Conn, http.Handler){},
	}

	coreHandler.Set(a)
}

// StartServer start the server
func (a *API) StartServer(address string) {
	listener, err := net.Listen("tcp", address)
	if err != nil {
		panic(err)
	}
	// The `Serve` call has to happen in its own goroutine because
	// it's blocking and we need to proceed to the rest of the core setup after
	// we call it.
	go func() {
		if err := a.server.Serve(listener); err != nil {
			panic(err)
		}
	}()
}

// NewAPI create and initialize the API
func NewAPI() *API {
	api := &API{}
	api.buildHandler()
	api.initServer()

	return api
}

func (a *API) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	a.handler.ServeHTTP(rw, req)
}

// buildHandler is in charge of all the rpc handling.
func (a *API) buildHandler() {
	walletEnable := false
	m := http.NewServeMux()
	m.Handle("/v1/version", jsonHandler(a.getVersion))

	// TODO: fix cors problems
	// m.Handle("/v1/compile/bin", jsonHandler(a.getBin))
	// m.Handle("/v1/compile/shift", jsonHandler(a.getShift))
	// m.Handle("/v1/compile/instance", jsonHandler(a.getInstance))
	// m.Handle("/v1/compile/ast", jsonHandler(a.getAst))
	m.HandleFunc("/v1/compile/bin", a.corsHandler)
	m.HandleFunc("/v1/compile/shift", a.corsHandler)
	m.HandleFunc("/v1/compile/instance", a.corsHandler)
	m.HandleFunc("/v1/compile/ast", a.corsHandler)
	// 设置静态目录
	path := "../ide/dist"
	fsh := http.FileServer(http.Dir(path))
	m.Handle("/", http.StripPrefix("/", fsh))

	handler := latencyHandler(m, walletEnable)
	handler = gzip.Handler{Handler: handler}

	a.handler = handler
}

// RedirectHandler redirect to dashboard handler
func RedirectHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		// if req.URL.Path == "/" {
		// 	http.Redirect(w, req, "/dashboard/", http.StatusFound)
		// 	return
		// }
		next.ServeHTTP(w, req)
	})
}

// json Handler
func jsonHandler(f interface{}) http.Handler {
	h, err := httpjson.Handler(f, errorFormatter.Write)
	if err != nil {
		panic(err)
	}
	return h
}

// error Handler
func alwaysError(err error) http.Handler {
	return jsonHandler(func() error { return err })
}

// latencyHandler take latency for the request url path, and redirect url path to wait-disable when wallet is closed
func latencyHandler(m *http.ServeMux, walletEnable bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		// latency for the request url path
		if l := latency(m, req); l != nil {
			defer l.RecordSince(time.Now())
		}
		// when the wallet is not been opened and the url path is not been found, modify url path to error,
		// and redirect handler to error
		// if _, pattern := m.Handler(req); pattern != req.URL.Path && !walletEnable {
		// 	req.URL.Path = "/error"
		// 	walletRedirectHandler(w, req)
		// 	return
		// }
		m.ServeHTTP(w, req)
	})
}

// walletRedirectHandler redirect to error when the wallet is closed
func walletRedirectHandler(w http.ResponseWriter, req *http.Request) {
	h := http.RedirectHandler(req.URL.String(), http.StatusMovedPermanently)
	h.ServeHTTP(w, req)
}
