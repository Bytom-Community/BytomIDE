const axios = require('axios')
axios.defaults.baseURL = 'http://localhost:9888'
const BYTOM_ASSET_ID = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const response = (ret) => {
  if (ret.status != 200) {
    throw `request failed ${ret.status}`
  }
  if (ret.data.status != 'success') {
    throw `request failed msg: ${ret.data.msg}, err: ${ret.data.error_detail}`
  }
  return ret.data.data
}

class Bytom {
  setNet = (net) => {
    axios.defaults.baseURL = net
  }
  restoreWallet = async (walletImage) => {
    let ret = await axios.post('/restore-wallet', walletImage).catch((e) => {
      throw e
    })
    return response(ret)
  }
  listAccounts = async (alias) => {
    let ret = await axios.post('/list-accounts', {
      alias
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }
  listAssets = async () => {
    let ret = await axios.post('/list-assets', {}).catch((e) => {
      throw e
    })
    return response(ret)
  }
  listBalances = async (account_alias) => {
    let ret = await axios.post('/list-balances', {
      account_alias
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }
  listAddress = async (account_alias) => {
    let ret = await axios.post('/list-addresses', {
      account_alias
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }

  compile = async (contract, args) => {
    let ret = await axios.post('/compile', {
      contract,
      args
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }

  createReceiver = async (account_alias, account_id) => {
    let ret = await axios.post('/create-account-receiver', {
      account_alias,
      account_id
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }
  listPubkeys = async (account_id) => {
    let ret = await axios.post('/list-pubkeys', {
      account_id
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }

  listTx = async (id) => {
    let ret = await axios.post('/list-transactions', {
      'id': id,
      'detail': true
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }

  buildTx = async (tx) => {
    let ret = await axios.post('/build-transaction', tx).catch((e) => {
      throw e
    })
    return response(ret)
  }


  signTx = async (password, transaction) => {
    let ret = await axios.post('/sign-transaction', {
      password,
      transaction
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }


  submitTx = async (raw_transaction) => {
    let ret = await axios.post('/submit-transaction', {
      raw_transaction
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }
  lock = async (accountId, password, bytomFee, assetAmount, assetId, contract, args) => {
    let ret = await this.compile(contract, args).catch((e) => {
      throw e
    })
    const time_range = Math.round(new Date().getTime() / 1000)
    const contractProgram = ret.program
    let tx = {
      "base_transaction": null,
      "actions": [{
          "account_id": accountId,
          "amount": bytomFee,
          "asset_id": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          "type": "spend_account"
        },
        {
          "account_id": accountId,
          "amount": assetAmount,
          "asset_id": assetId,
          "type": "spend_account"
        },
        {
          "amount": assetAmount,
          "asset_id": assetId,
          "control_program": contractProgram,
          "type": "control_program"
        }
      ],
      "ttl": 0,
      "time_range": time_range
    }
    ret = await this.buildTx(tx).catch((e) => {
      throw e
    })
    ret = await this.signTx(password, ret)
    if (!ret.hasOwnProperty('transaction')) {
      throw `ret has no transaction field`
    }
    if (!ret.transaction.hasOwnProperty('raw_transaction')) {
      throw `ret.transaction has no raw_transaction field`
    }
    ret = await this.submitTx(ret.transaction.raw_transaction)
    return ret.tx_id
  }

  isTxConfirmed = async (id) => {
    let ret = await axios.post('/get-unconfirmed-transaction', {
      'tx_id': id,
    }).catch((e) => {
      throw e
    })
    if (ret.status != 200) {
      throw `request failed ${ret.status}`
    }
    return (ret.data.status != 'success')
  }

  fintUTXOId = async (txId, contractProgram) => {
    let ret = await this.listTx(txId)
    let utxoId = ''
    let findTx = ret[0]
    for (let utxo of findTx.outputs) {
      if (utxo.type != 'control') {
        continue
      }
      if (utxo.control_program != contractProgram) {
        continue
      }
      utxoId = utxo.id
      break
    }
    return utxoId
  }
  listutxo = async (utxoid) => {
    let ret = await axios.post('/list-unspent-outputs', {
      "id": utxoid,
      "smart_contract": true
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }
  decodeProgram = async (program) => {
    let ret = await axios.post('/decode-program', {
      program
    }).catch((e) => {
      throw e
    })
    return response(ret)
  }

  // utxo: utxo
  // index: clause index
  // args: lock contract args
  // params: unlock clause  argments
  // requires: requires lock action
  // accountId: unlock user accountId
  // password: unlock user password
  // fee: bytom fee
  unlock = async (utxo, index, args, params, requires, alias, password, fee) => {
    let accs = await this.listAccounts(alias)
    if (!accs || !accs.length) {
      return
    }
    let accountId = accs[0].id
    let spendutxo = {
      "output_id": utxo.id,
      "arguments": [],
      "type": "spend_account_unspent_output"
    }
    let publicKeysFromArgs = []
    for (let arg of args) {
      if (arg.type != "PublicKey") {
        continue
      }
      publicKeysFromArgs.push(arg.value)
    }
    for (let p of params) {
      if (p.type != 'Signature') {
        spendutxo.arguments.push({
          "type": p.type,
          "raw_data": p.value
        })
        continue
      }

      let pubkeyObj = await this.listPubkeys(accountId)
      if (!pubkeyObj || !pubkeyObj.hasOwnProperty('pubkey_infos') || pubkeyObj['pubkey_infos'].length == 0) {
        continue
      }
      let allpks = pubkeyObj['pubkey_infos']
      for (let pk of allpks) {
        if (publicKeysFromArgs.indexOf(pk.pubkey) == -1) {
          continue
        }
        spendutxo.arguments.push({
          "type": "raw_tx_signature",
          "raw_data": {
            "xpub": pubkeyObj['root_xpub'],
            "derivation_path": pk['derivation_path']
          }
        })
        break
      }
    }

    // push clause selector
    spendutxo.arguments.push({
      "type": "integer",
      "raw_data": {
        "value": index
      }
    })


    const time_range = Math.round(new Date().getTime() / 1000)
    let tx = {
      "base_transaction": null,
      "actions": [spendutxo],
      "ttl": 0,
      "time_range": time_range
    }
    for (let re of requires) {
      tx.actions.push({
        "amount": re.amount,
        "asset_id": re.assetId,
        "control_program": re.program,
        "type": "control_program"
      })
      tx.actions.push({
        "account_id": accountId,
        "amount": re.amount,
        "asset_id": re.assetId,
        "type": "spend_account"
      })
    }
    tx.actions.push({
      "account_id": accountId,
      "amount": fee,
      "asset_id": BYTOM_ASSET_ID,
      "type": "spend_account"
    })

    if (utxo.amount > 0) {
      let addresses = await this.listAddress(alias)
      if (addresses.length == 0) {
        throw `no control program of ${alias} for unlock asset`
      }
      tx.actions.push({
        "amount": utxo.amount,
        "asset_id": utxo.asset_id,
        "control_program": addresses[0].control_program,
        "type": "control_program"
      })
    }
    let ret = await this.buildTx(tx).catch((e) => {
      console.log('build tx err')
      throw e
    })
    ret = await this.signTx(password, ret)
    if (!ret.hasOwnProperty('transaction')) {
      console.log('sign tx err')
      throw `ret has no transaction field`
    }
    if (!ret.transaction.hasOwnProperty('raw_transaction')) {
      throw `ret.transaction has no raw_transaction field`
    }
    ret = await this.submitTx(ret.transaction.raw_transaction)
    return ret.tx_id
  }
}

export {
  Bytom
}
