import Bytom from "bytom-js-sdk"
import {
  Common,
  ParamType
} from "../common/const.js";
const axios = require('axios')

const net = {
  main: "https://api.bycoin.im:8000/",
  test: "http://app.bycoin.io:3020/"
}
axios.defaults.baseURL = net.main
const config = require("../utils/config.js").config()
const equitySvrRoot = `${config.baseUrl}:${config.port}/${config.apiVersion}`

class BytomAPI {
  constructor(_localRpc) {
    this.localRpc = _localRpc
  }
  currentAccount = async () => {
    let acc = await window.bytom.request("currentAccount").catch((e) => {
      console.log('[ERROR] get current account err', e)
      throw e
    })
    return acc
  }
  addrToScript = async (addr) => {
    let pm = {
      Address: addr
    }
    let ret = await axios.post(`${equitySvrRoot}/tool/addr-to-script`, pm).catch((e) => {
      throw e
    })
    if (!ret || !ret.data || ret.data.status != 'success') {
      throw 'request failed'
    }
    return ret.data.data.script
  }
  decodeProgram = async (program) => {
    let pm = {
      Program: program
    }
    let ret = await axios.post(`${equitySvrRoot}/tool/decode-program`, pm).catch((e) => {
      throw e
    })
    if (!ret || !ret.data || ret.data.status != 'success') {
      throw 'request failed'
    }
    return ret.data.data.instructions
  }
  listUtxos = async (assetId, addr) => {
    // TODO: find all utxos of start/limit
    const script = await this.addrToScript(addr)
    if (!script || !script.length) {
      return []
    }
    const pm = {
      "Filter": {
        "asset": assetId,
        "script": script,
        "unconfirmed": false
      },
      "Sorter": {
        "by": "amount",
        "order": "desc"
      }
    }
    let limit = 100
    let start = 0
    let ret = await axios.post(`api/v1/btm/q/list-utxos?limit=${limit}&start=${start}`, pm).catch((e) => {
      throw e
    })
    if (ret && ret.data.code == 200 && ret.data.result.data) {
      return ret.data.result.data
    }
  }

  /**
   * find utxo id for a submitting tx
   * @param assetId{string} asset id
   * @param program{string} program script
   * @param assetAmount{number} asset amount
   *
   * @memberof BytomAPI
   */
  findUtxoid = async (assetId, program, assetAmount) => {
    const pm = {
      "Filter": {
        "asset": assetId,
        "script": program,
        "unconfirmed": true
      },
      "Sorter": {
        "by": "amount",
        "order": "desc"
      }
    }
    let limit = 100
    let start = 0
    // FIXME: unconfirmed not work?
    let ret = await axios.post(`api/v1/btm/q/list-utxos?limit=${limit}&start=${start}`, pm).catch((e) => {
      throw e
    })
    if (!ret || !ret.data || ret.data.code != 200 || !ret.data.result.data) {
      return ''
    }
    for (let utxo of ret.data.result.data) {
      if (utxo.asset == assetId && utxo.amount == assetAmount) {
        return utxo.hash
      }
    }
    return ''
  }

  findUtxo = async (assetId, program, hash) => {
    const pm = {
      "Filter": {
        "asset": assetId,
        "script": program,
        "unconfirmed": false
      },
      "Sorter": {
        "by": "amount",
        "order": "desc"
      }
    }
    let limit = 100
    let start = 0
    while (true) {
      let ret = await axios.post(`api/v1/btm/q/list-utxos?limit=${limit}&start=${start}`, pm).catch((e) => {
        throw e
      })
      if (!ret || !ret.data || ret.data.code != 200 || !ret.data.result.data) {
        return null
      }
      for (let utxo of ret.data.result.data) {
        if (utxo.asset == assetId && utxo.hash == hash) {
          utxo.program = program
          return utxo
        }
      }
      if (ret.data.result.data.length == 0) {
        break
      }
      start += limit
    }
    return null
  }


  /**
   * get utxo object from utxoid
   *
   * @param {*} utxoId
   * @memberof BytomAPI
   */
  getUtxoFromId = async (guid, utxoId) => {
    // list tx to find program
    let limit = 10
    let start = 0
    let pm = {
      guid
    }

    while (true) {
      let ret = await axios.post(`/api/v1/btm/merchant/list-transactions?limit=${limit}&start=${start}`, pm).catch((e) => {
        throw e
      })
      if (!ret || !ret.data || ret.data.code != 200 || !ret.data.result.data) {
        return null
      }
      if (ret.data.result.data.length == 0) {
        break
      }
      for (let tx of ret.data.result.data) {
        if (tx.status_fail) {
          continue
        }
        for (let output of tx.outputs) {
          if (output.address != "smart contract" || output.script.length == Common.BTM_ACCOUNT_SCRIPT_LENGTH) {
            continue
          }
          let utxo = this.findUtxo(output.asset, output.script, utxoId)
          if (utxo) {
            return utxo
          }
        }
      }
      start += limit
    }
    return null
  }
  /**
   *
   * get all utxos for input
   * @param {array} utxos
   * @param {number} amount
   * @returns matched utxo array
   * @memberof BytomAPI
   */
  matchUtxos(utxos, amount) {
    let match = []
    let accumulative = 0
    for (let utxo of utxos) {
      match.push(utxo)
      accumulative += utxo.amount
      if (accumulative >= amount) {
        break
      }
    }
    return match
  }
  listAccountAlias = async () => {
    let accs = await window.bytom.request("listAllAccount").catch((e) => {
      console.log('[ERROR] list all account err', e)
      throw e
    })
    let aliases = []
    for (let v of accs) {
      aliases.push(v.alias)
    }
    return aliases
  }

  getGuid = async (alias) => {
    let accs = await window.bytom.request("listAllAccount").catch((e) => {
      console.log('[ERROR] list all account err', e)
      throw e
    })
    for (let acc of accs) {
      if (acc.alias != alias) {
        continue
      }
      return acc.guid
    }
    return ""
  }

  /**
   *list all asset {id, alias} for account
   * @param guid 
   * @memberof BytomAPI
   */
  listAssets = async (guid) => {
    let start = 0
    let limit = 100
    let pm = {
      guid
    }
    let ret = await axios.post(`api/v1/btm/account/list-addresses?limit=${limit}&start=${start}`, pm).catch((e) => {
      throw e
    })
    if (!ret || !ret.data.code == 200 || !ret.data.result.data) {
      return []
    }
    let assets = []
    let assetIds = []
    for (let addr of ret.data.result.data) {
      for (let bal of addr.balances) {
        if (assetIds.indexOf(bal.asset) != -1) {
          continue
        }
        assetIds.push(bal.asset)
        let assetObj = {
          id: bal.asset,
        }
        if (bal.alias && bal.alias.length) {
          assetObj['alias'] = bal.alias
        }
        assets.push(assetObj)
      }
    }
    for (let asset of assets) {
      if (asset.alias && asset.alias.length) {
        continue
      }
      let ret = await axios.get(`https://blockmeta.com/api/v2/asset/${asset.id}`).catch((e) => {
        throw e
      })
      if (!ret || !ret.data || !ret.data.name) {
        continue
      }
      asset.alias = ret.data.name
    }
    return assets
  }
  getBalance = async (guid, assetId) => {
    let bal = await window.bytom.request('balance', {
      id: assetId,
      guid: guid
    }).catch((e) => {
      throw e
    })
    return bal
  }
  listAddresses = async (guid) => {

  }
  /*
   * getInstance get instance of contract by equity tool api 
   */
  getInstance = async (contract, args) => {
    let index = contract.indexOf("(")
    if (index == -1) {
      throw 'contract name not found'
    }
    let subs = contract.substring(0, index).split(" ")
    let contractName = ''
    for (let i = subs.length - 1; i > 0; i--) {
      if (subs[i] && subs[i].length) {
        contractName = subs[i].trim()
      }
    }
    let argus = [contractName]
    argus.push(...args)
    let pm = {
      Code: contract,
      Args: argus
    }
    const ret = await axios.post(`${equitySvrRoot}/compile/instance`, pm).catch((e) => {
      throw e
    })
    if (!ret || !ret.data || ret.data.status != 'success') {
      throw 'request failed'
    }
    return ret.data.data.instance
  }
  /**
   * @param bytomFee {number} fee paid in bytom
   * @param assetAmount {number} lock asset amount
   * @param assetId {string} lock asset id
   * @param contract {string} contract code
   * @param args {array} array for contract params
   * @memberof BytomAPI
   */
  lock = async (bytomFee, assetAmount, assetId, contract, args) => {
    if (typeof window.bytom === 'undefined') {
      throw `window.bytom is nil`
    }
    let account = await window.bytom.request("currentAccount").catch((e) => {
      throw e
    })
    if (!account) {
      throw 'current account is nil'
    }
    let bal = await window.bytom.request('balance', {
      id: assetId,
      guid: account.guid
    }).catch((e) => {
      throw e
    })
    if (bal < assetAmount) {
      throw 'insufficient balance'
    }
    let utxos = await this.listUtxos(assetId, account.address)
    if (!utxos || !utxos.length) {
      throw `insufficient utxo`
    }
    const contractProgram = await this.getInstance(contract, args).catch((e) => {
      throw e
    })
    let input = []
    let accumulative = 0
    for (let utxo of utxos) {
      input.push({
        "type": "spend_wallet",
        "asset": assetId,
        "amount": utxo.amount
      })
      accumulative += utxo.amount
      if (accumulative >= assetAmount) {
        break
      }
    }
    let ouput = [{
      "amount": assetAmount,
      "asset": assetId,
      "control_program": contractProgram,
      "type": "control_program"
    }]
    if (accumulative > assetAmount) {
      ouput.push({
        "amount": accumulative - assetAmount,
        "asset": assetId,
        "address": account.address,
        "type": "control_address"
      })
    }
    let ret = await window.bytom.advancedTransfer(
      input,
      ouput,
      bytomFee,
      [],
      1
    ).catch((err) => {
      console.log("[ERROR] advancedTransfer err", err)
      throw err
    })
    return ret
  }
  unlock = async (utxo, clauseIndex, unlock, bytomFee) => {
    if (typeof window.bytom === 'undefined') {
      throw `window.bytom is nil`
    }
    let input = []
    const spendUtxo = {
      "type": "spend_utxo",
      "output_id": utxo.id
    }
    input.push(spendUtxo)
    let accs = await window.bytom.request("listAllAccount").catch((e) => {
      console.log('[ERROR] listAllAccount err', e)
      throw e
    })
    let unlockAddr
    for (let acc of accs) {
      if (acc.alias == unlock.account) {
        unlockAddr = acc.address
      }
    }
    let output = []
    let unlockOutput = {
      "amount": parseInt(utxo.amount),
      "asset": utxo.asset,
      "address": unlockAddr,
      "type": "control_address"
    }
    output.push(unlockOutput)
    let args = []
    for (let param of unlock.params) {
      args.push({
        type: param.type.toLowerCase(),
        value: param.value
      })
    }
    if (clauseIndex != 0) {
      args.push({
        type: "integer",
        value: clauseIndex
      })
    }

    let ret = await window.bytom.advancedTransfer(
      input,
      output,
      bytomFee,
      args,
      1
    ).catch((err) => {
      console.log("[ERROR] advancedTransfer err", err)
      throw err
    })
    return ret
  }
}

export {
  BytomAPI
}
