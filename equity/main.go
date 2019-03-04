package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/Bytom-Community/BytomIDE/equity/api"
)

func main() {
	equityAPI := api.NewAPI()
	// host := "localhost"
	host := "0.0.0.0"
	serverAddr := host + ":8080"
	if len(os.Args) >= 2 {
		port := flag.String("port", "p", "Server port")
		flag.CommandLine.Parse(os.Args[1:])
		serverAddr = fmt.Sprintf("%s:%s", host, *port)
	}
	fmt.Printf("listenning on %s\n", serverAddr)
	equityAPI.StartServer(serverAddr)
	waitToExit()
}

func waitToExit() {
	exit := make(chan bool, 0)
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP)
	go func() {
		for sig := range sc {
			fmt.Printf("server received exit signal:%v.\n", sig.String())
			close(exit)
			break
		}
	}()
	<-exit
}
