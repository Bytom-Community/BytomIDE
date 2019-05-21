package api

import (
	"encoding/hex"
	"fmt"

	"github.com/bytom/common"
	"github.com/bytom/consensus"
	"github.com/bytom/consensus/segwit"
	"github.com/bytom/protocol/vm"
	"github.com/bytom/protocol/vm/vmutil"
)

type DecodeProgReq struct {
	Program string `json:"program"`
}

// DecodeProgResp is response for decode program
type DecodeProgResp struct {
	Instructions string `json:"instructions"`
}

func (a *API) decodeProgram(ins *DecodeProgReq) Response {
	prog, err := hex.DecodeString(ins.Program)
	if err != nil {
		return NewErrorResponse(err)
	}

	// if program is P2PKH or P2SH script, convert it into actual executed program
	if segwit.IsP2WPKHScript(prog) {
		if witnessProg, err := segwit.ConvertP2PKHSigProgram(prog); err == nil {
			prog = witnessProg
		}
	} else if segwit.IsP2WSHScript(prog) {
		if witnessProg, err := segwit.ConvertP2SHProgram(prog); err == nil {
			prog = witnessProg
		}
	}

	insts, err := vm.ParseProgram(prog)
	if err != nil {
		return NewErrorResponse(err)
	}

	var result string
	for _, inst := range insts {
		result += fmt.Sprintf("%s %s\n", inst.Op, hex.EncodeToString(inst.Data))
	}
	return NewSuccessResponse(DecodeProgResp{Instructions: result})
}

type AddressToScriptReq struct {
	Address string `json:"address"`
}

type AddressToScriptResp struct {
	Script string `json:"script"`
}

func (a *API) addressToScript(ins *AddressToScriptReq) Response {
	addr, err := common.DecodeAddress(ins.Address, &consensus.ActiveNetParams)
	if err != nil {
		return NewErrorResponse(err)
	}
	redeemContract := addr.ScriptAddress()
	program := []byte{}
	switch addr.(type) {
	case *common.AddressWitnessPubKeyHash:
		program, err = vmutil.P2WPKHProgram(redeemContract)
	case *common.AddressWitnessScriptHash:
		program, err = vmutil.P2WSHProgram(redeemContract)
	default:
		return NewErrorResponse(err)
	}
	if err != nil {
		return NewErrorResponse(err)
	}
	return NewSuccessResponse(AddressToScriptResp{Script: hex.EncodeToString(program)})
}
