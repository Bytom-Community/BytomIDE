const needLockAsset = (code) => {
  let left = code.indexOf("{")
  if (left == -1) {
    return false
  }
  let firstline = code.substring(0, left)
  return (firstline.indexOf("locks") != -1 && firstline.indexOf("of") != -1)
}

/**
 * parse params from code
 * return null if failed, return [params] if success
 * @param {*} code
 */
const parseParams = (code) => {
  let left = code.indexOf("{")
  if (left == -1) {
    return
  }
  let firstline = code.substring(0, left)
  let start = firstline.indexOf("(")
  let end = firstline.indexOf(")")
  if (start == -1 || end == -1 || start + 1 >= end) {
    return
  }
  let paramStr = firstline.substring(start + 1, end)
  if (!paramStr.length) {
    return
  }
  let paramPairs = paramStr.split(",")
  if (!paramPairs || !paramPairs.length) {
    return
  }
  let params = []
  for (let pair of paramPairs) {
    if (pair.indexOf(":") == -1) {
      continue
    }
    let valueType = pair.split(":")
    params.push({
      name: valueType[0].trim(),
      type: valueType[1].trim(),
    })
  }
  return params
}

import {
  ParamInputType,
  ParamType
} from "../common/const"

const makeParamAnswers = (params) => {
  let paramAnswer = []
  for (let param of params) {
    switch (param.type) {
      case ParamType.PublicKey: {
        paramAnswer.push({
          type: param.type,
          inputType: ParamInputType.InputPublicKey,
          alias: '',
          publicKey: '',
        })
        break
      }
      case ParamType.Program: {
        paramAnswer.push({
          type: param.type,
          inputType: ParamInputType.InputProgram,
          alias: '',
          program: '',
        })
        break
      }
      case ParamType.Amount: {
        paramAnswer.push({
          type: param.type,
          // pgType: this.$t('Lock.Amount'),
          amount: 0,
        })
        break
      }
      case ParamType.Asset: {
        paramAnswer.push({
          type: param.type,
          inputType: ParamInputType.SelectAsset,
          asset_alias: '',
          asset_id: '',
        })
        break
      }
      case ParamType.Boolean: {
        paramAnswer.push({
          type: param.type,
          value: false,
        })
        break
      }
      case ParamType.Integer: {
        paramAnswer.push({
          type: param.type,
          value: 0,
        })
        break
      }
      case ParamType.Hash: {
        paramAnswer.push({
          type: param.type,
          value: '',
        })
        break
      }
      case ParamType.String: {
        paramAnswer.push({
          type: param.type,
          value: '',
        })
        break
      }
      default:
        paramAnswer.push({})
        break
    }
  }
  return paramAnswer
}

const convertParamAnswerToArgs = (paramAnswer) => {
  let args = []
  for (let param of paramAnswer) {
    if (param.type == ParamType.Boolean) {
      args.push({
        boolean: param.value
      })
      continue
    }
    if (param.type == ParamType.Integer || param.type == ParamType.Amount) {
      args.push({
        integer: parseInt(param.amount)
      })
      continue
    }

    if (param.type == ParamType.String || param.type == ParamType.Hash) {
      args.push({
        string: param.value
      })
      continue
    }

    if (param.type == ParamType.Asset) {
      args.push({
        string: asset_id
      })
      continue
    }

    if (param.type == ParamType.Program) {
      args.push({
        string: param.program
      })
      continue
    }
    if (param.type == ParamType.PublicKey) {
      args.push({
        string: param.publicKey
      })
      continue
    }
  }
  return args
}

const decodeInstructions = (instructions) => {
  let byteCode = ''
  let args = []
  let parts = instructions.split("\n")
  for (let part of parts) {
    if (part.indexOf('DEPTH') != -1) {
      if (parts.indexOf(part) + 1 >= parts.length) {
        break
      }
      let byteCodeValueType = (parts[parts.indexOf(part) + 1]).split(" ")
      if (!byteCodeValueType || byteCodeValueType.length != 2) {
        break
      }
      byteCode = byteCodeValueType[1].trim()
      break
    }
    let valueType = part.split(" ")
    let type = valueType[0].trim()
    let value = valueType[1].trim()
    if (type == "DATA_32" || type == "DATA_22") {
      args.unshift({
        "string": value
      })
    } else if (type == "DATA_4") {
      args.unshift({
        "integer": parseInt('0x' + value.match(/../g).reverse().join(''))
      })
    } else {
      args.unshift({
        "boolean": value
      })
    }
  }
  return {
    byteCode,
    args
  }
}

const inheritUtxo = (utxo, assets) => {
  let newUtxo = utxo
  if (!newUtxo.asset_id) {
    newUtxo.asset_id = utxo.asset
  }
  if (!newUtxo.asset_alias) {
    for (let a of assets) {
      if (a.id == newUtxo.asset_id) {
        newUtxo.asset_alias = a.alias
        break
      }
    }
  }
  if (!newUtxo.id) {
    newUtxo.id = utxo.hash
  }
  return newUtxo
}
export {
  needLockAsset,
  parseParams,
  makeParamAnswers,
  convertParamAnswerToArgs,
  decodeInstructions,
  inheritUtxo
}
