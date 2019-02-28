package version

var (
	// The full version string
	Version = "1.0.0"
	// GitCommit is set with go build --ldflags "-X github.com/Bytom-Community/BytomIDE/equity/version.GitCommit=$(git rev-parse HEAD)"
	GitCommit string
)

func init() {
	if GitCommit != "" {
		Version += "+" + GitCommit[:8]
	}
}
