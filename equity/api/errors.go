package api

import (
	"github.com/bytom/errors"
	"github.com/bytom/net/http/httperror"
)

var (
	ErrDefault     = errors.New("BytomIDE API Error")
	ErrCompileErr  = errors.New("Compile Contract Failed")
	ErrShiftErr    = errors.New("Contract Shift Error")
	ErrInstanceErr = errors.New("Instance Error")
	ErrAstErr      = errors.New("AST Error")
)

var respErrFormatter = map[error]httperror.Info{
	ErrDefault: {HTTPStatus: 500, ChainCode: "BTM000", Message: "BytomIDE API Error"},

	ErrCompileErr:  {HTTPStatus: 400, ChainCode: "BTM001", Message: "Compile Contract Failed"},
	ErrShiftErr:    {HTTPStatus: 401, ChainCode: "BTM002", Message: "Contract Shift Error"},
	ErrInstanceErr: {HTTPStatus: 402, ChainCode: "BTM003", Message: "Instance Error"},
	ErrAstErr:      {HTTPStatus: 403, ChainCode: "BTM004", Message: "AST Error"},
}

// Map error values to standard bytom error codes. Missing entries
// will map to internalErrInfo.
//
// TODO(jackson): Share one error table across Chain
// products/services so that errors are consistent.
var errorFormatter = httperror.Formatter{
	Default: httperror.Info{HTTPStatus: 500, ChainCode: "BTM000", Message: "BytomIDE API Error"},
}
