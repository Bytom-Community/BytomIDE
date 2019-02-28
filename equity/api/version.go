package api

import "github.com/Bytom-Community/BytomIDE/equity/version"

// Version
type Version struct {
	Version string `json:"version"`
}

func (a *API) getVersion() Response {
	resp := &Version{
		Version: version.Version,
	}
	return NewSuccessResponse(resp)
}
