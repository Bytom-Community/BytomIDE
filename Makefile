GB=go build
BUILD_FLAGS=--ldflags "-X github.com/Bytom-Community/BytomIDE/equity/version.GitCommit=$(git rev-parse HEAD)"

equity-linux:
	GOOS=linux GOARCH=amd64 $(GB) $(BUILD_FLAGS) -o equity-linux-amd64 equity/main.go
