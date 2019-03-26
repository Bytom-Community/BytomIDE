package api

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	bytomErr "github.com/bytom/errors"
	"github.com/equity/compiler"
	equ "github.com/equity/equity/util"
)

// CompilerResp
type CompilerResp struct {
	Bin      string `json:"bin,omitempty"`
	Shift    string `json:"shift,omitempty"`
	Instance string `json:"instance,omitempty"`
	Ast      string `json:"ast,omitempty"`
}

type CompileReq struct {
	Code string   `json:"code"`
	Args []string `json:"args"`
}

func (a *API) corsHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Fprintf(w, `{"status": "fail" }`)
		return
	}
	var t *CompileReq
	err = json.Unmarshal(body, &t)
	if err != nil {
		fmt.Fprintf(w, `{"status": "fail" }`)
		return
	}
	fmt.Printf("method: %s, url:%s, code-len:%d, args-len:%d\n", req.Method, req.URL.Path, len(t.Code), len(t.Args))
	var ret Response
	switch req.URL.Path {
	case "/v1/compile/bin":
		ret = a.getBin(t)
	case "/v1/compile/ast":
		ret = a.getAst(t)
	case "/v1/compile/instance":
		ret = a.getInstance(t)
	case "/v1/compile/shift":
		ret = a.getShift(t)
	default:
		fmt.Fprintf(w, `{"status": "fail" }`)
		return
	}
	marRet, err := json.Marshal(ret)
	if err != nil {
		fmt.Fprintf(w, `{"status": "fail" }`)
		return
	}
	fmt.Fprintf(w, string(marRet))
}

func (a *API) getBin(req *CompileReq) Response {
	reader := bytes.NewReader([]byte(req.Code))
	contracts, err := compiler.Compile(reader)
	if err != nil {
		fmt.Println("Compile contract failed:", err)
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, err.Error()))
	}

	if len(contracts) == 0 {
		fmt.Println("The contract is empty!")
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, "The contract is empty!"))
	}
	bin := ""
	// Print the result for all contracts
	for _, contract := range contracts {
		// bin = fmt.Sprintf("======= %v =======\n", contract.Name) + "Binary:\n" + fmt.Sprintf("%v\n\n", hex.EncodeToString(contract.Body))
		bin += fmt.Sprintf("%v\n\n", hex.EncodeToString(contract.Body))
	}
	resp := &CompilerResp{
		Bin: bin,
	}
	return NewSuccessResponse(resp)
}

func (a *API) getShift(req *CompileReq) Response {
	reader := bytes.NewReader([]byte(req.Code))
	contracts, err := compiler.Compile(reader)
	if err != nil {
		fmt.Println("Compile contract failed:", err)
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, err.Error()))
	}

	if len(contracts) == 0 {
		fmt.Println("The contract is empty!")
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, "The contract is empty!"))
	}
	result := ""
	// Print the result for all contracts
	for _, contract := range contracts {
		// shift += "Clause shift:\n"
		clauseMap, err := equ.Shift(contract)
		if err != nil {
			fmt.Println("Statistics contract clause shift error:", err)
			return NewErrorResponse(bytomErr.Wrapf(ErrShiftErr, "Statistics contract clause shift error: %s", err))
		}

		for clause, shift := range clauseMap {
			result += fmt.Sprintf("    %s:  %v\n", clause, shift)
		}
	}
	resp := &CompilerResp{
		Shift: result,
	}
	return NewSuccessResponse(resp)
}

func (a *API) getInstance(req *CompileReq) Response {
	reader := bytes.NewReader([]byte(req.Code))
	contracts, err := compiler.Compile(reader)
	if err != nil {
		fmt.Println("Compile contract failed:", err)
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, err.Error()))
	}

	if len(contracts) == 0 {
		fmt.Println("The contract is empty!")
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, "The contract is empty!"))
	}
	ins := ""
	// Print the result for all contracts
	for i, contract := range contracts {
		if i != len(contracts)-1 {
			continue
		}

		if len(req.Args)-1 < len(contract.Params) {
			usage := fmt.Sprintf("Error: The number of input arguments %d is less than the number of contract parameters %d\n", len(req.Args)-1, len(contract.Params))
			usage += fmt.Sprintf("Usage:\n  equity %s", req.Args[0])
			for _, param := range contract.Params {
				usage = usage + " <" + param.Name + ">"
			}
			return NewErrorResponse(bytomErr.Wrapf(ErrInstanceErr, "%s\n\n", usage))
		}

		contractArgs, err := equ.ConvertArguments(contract, req.Args[1:len(contract.Params)+1])
		if err != nil {
			return NewErrorResponse(bytomErr.Wrapf(ErrInstanceErr, "Convert arguments into contract parameters error: %s", err))
		}

		instantProg, err := equ.InstantiateContract(contract, contractArgs)
		if err != nil {
			return NewErrorResponse(bytomErr.Wrapf(ErrInstanceErr, "Instantiate contract error: %s", err))
		}
		ins += hex.EncodeToString(instantProg)
		if i != len(contracts)-1 {
			ins += ","
		}
	}
	resp := &CompilerResp{
		Instance: ins,
	}
	return NewSuccessResponse(resp)
}

func (a *API) getAst(req *CompileReq) Response {
	reader := bytes.NewReader([]byte(req.Code))
	contracts, err := compiler.Compile(reader)
	if err != nil {
		fmt.Println("Compile contract failed:", err)
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, err.Error()))
	}

	if len(contracts) == 0 {
		fmt.Println("The contract is empty!")
		return NewErrorResponse(bytomErr.Wrap(ErrCompileErr, "The contract is empty!"))
	}
	ast := "Ast:\n"
	// Print the result for all contracts
	for _, contract := range contracts {
		rawData, err := equ.JSONMarshal(contract, true)
		if err != nil {
			return NewErrorResponse(bytomErr.Wrapf(ErrAstErr, "Marshal the struct of contract to json error: %s", err))
		}
		ast += fmt.Sprintf("%s\n", (string(rawData)))
	}
	resp := &CompilerResp{
		Ast: ast,
	}
	return NewSuccessResponse(resp)
}
