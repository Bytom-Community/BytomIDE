package api

import (
	"github.com/bytom/errors"
	"github.com/bytom/net/http/httperror"
)

var (
	ErrDefault = errors.New("BytomIDE API Error")
)

var respErrFormatter = map[error]httperror.Info{
	ErrDefault: {HTTPStatus: 500, ChainCode: "BTM000", Message: "BytomIDE API Error"},
}

// Map error values to standard bytom error codes. Missing entries
// will map to internalErrInfo.
//
// TODO(jackson): Share one error table across Chain
// products/services so that errors are consistent.
var errorFormatter = httperror.Formatter{
	Default: httperror.Info{HTTPStatus: 500, ChainCode: "BTM000", Message: "BytomIDE API Error"},
}
