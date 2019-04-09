<template>
  <div class="lock-pane">
    <el-row>
      <el-col :span="8">{{ $t('Lock.NetType')}}:</el-col>
      <el-col :span="16">
        <el-radio-group v-model="netType">
          <el-radio :label="$t('Lock.MainNet')" @change="selectNetType">{{$t('Lock.MainNet')}}
          </el-radio>
          <el-radio :label="$t('Lock.TestNet')" @change="selectNetType">{{$t('Lock.TestNet')}}
          </el-radio>
          <el-radio :label="$t('Lock.CustomNet')" @change="selectNetType">{{$t('Lock.CustomNet')}}
          </el-radio>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row v-show="netType==$t('Lock.CustomNet')">
      <el-input v-model="netAddr" :placeholder="$t('Lock.CustomNetPrompt')" clearable>
      </el-input>
    </el-row>
    <!-- TODO: underline -->
    <el-row type="flex" align="middle" style="border-bottom:1px solid; border-bottom-color: rgb(220, 223, 230); ">
      <el-col :span="8">{{ $t('Lock.Restore')}}:</el-col>
      <el-col :span="16">
        <el-upload action="" :multiple=false :limit="1" :on-exceed="handleUploadExceed" :on-progress="handleUpload">
          <slot name="upload-item">
            <el-button size="mini">{{ $t('Lock.WalletFile')}}</el-button>
          </slot>
          <slot name="tip"> <span style="font-size:10pt;">{{ walletFileName }}</span></slot>
        </el-upload>
      </el-col>
    </el-row>
    <div class="lockof" v-show="lockof">
      <el-row>
        {{ $t('Lock.LockAsset')}}:
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.Account')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="lockAccount" :placeholder="$t('Lock.SelectAccount')">
            <el-option :label="a" :value="a" v-for="a in alias" :key="a"></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-radio-group v-model="assetFrom">
          <el-radio :label="$t('Lock.SelectAsset')">
            {{$t('Lock.SelectAsset')}}
          </el-radio>
          <el-radio :label="$t('Lock.InputAssetID')">
            {{$t('Lock.InputAssetID')}}
          </el-radio>
        </el-radio-group>
      </el-row>
      <el-row type="flex" align="middle" v-if="assetFrom==$t('Lock.SelectAsset')">
        <el-col :span="6">
          <div>{{ $t('Lock.Asset')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="lockAsset" :placeholder="$t('Lock.SelectAsset')" @change="selectAsset">
            <el-option :label="a" :value="a" v-for="a in assets" :key="a"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-input v-model="lockAssetId" :placeholder="$t('Lock.InputAssetID')"></el-input>
      </el-row>

      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.LockAssetAmount')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input v-model="lockAssetAmount" :placeholder="$t('Lock.LockAssetAmountPrompt')"></el-input>
        </el-col>
      </el-row>
      <el-row type="flex" justify="end" style="font-size: 10pt;">
        {{avaliableAssetAmount}} {{ $t('Lock.AssetAvaliable')}}
      </el-row>

      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.AccountPassword')}}:</div>
        </el-col>
        <el-col :span="18">
          <!-- TODO: show password if needed -->
          <el-input type="password" v-model="accountPassword" :placeholder="$t('Lock.AccountPasswordPrompt')">
          </el-input>
        </el-col>
      </el-row>

      <el-row type="flex" align="middle" style="border-bottom:1px solid; border-bottom-color: rgb(220, 223, 230); ">
        <el-col :span="6">
          <div>{{ $t('Lock.Gas')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input v-model="gas" :placeholder="$t('Lock.GasPrompt')" class="input-with-select">
            <el-select v-model="gasType" slot="append" :placeholder="$t('Lock.GasPrompt')" style="width: 6vw;">
              <el-option :label="gt" :value="gt" v-for='gt in ["BTM", "mBTM", "NEU"]' :key="gt"></el-option>
            </el-select>
          </el-input>
        </el-col>
      </el-row>


    </div>

    <div class="contract-parameters" v-show="params&&params.length">
      <el-row>
        {{ $t('Lock.ContractParameters')}}:
      </el-row>
      <div class="parameter-warp" v-for="(p,i) in params">
        <el-row class="middle-fontsize"> {{ p.name }}:{{p.type}}</el-row>
        <!-- public key -->
        <div class="param-pk" v-if="p.type=='PublicKey'&&(paramAnswer!=null)">
          <el-row>
            <el-radio-group v-model="paramAnswer[i].pkType">
              <el-radio :label="$t('Lock.GenPk')">
                {{$t('Lock.GenPk')}}
              </el-radio>
              <el-radio :label="$t('Lock.InputPk')">
                {{$t('Lock.InputPk')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="paramAnswer[i].pkType==$t('Lock.GenPk')">
            <el-col :span="6">
              <div>{{ $t('Lock.Account')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="paramAnswer[i].alias" :placeholder="$t('Lock.SelectAccount')">
                <el-option :label="al" :value="al" v-for="al in alias" :key="al"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="paramAnswer[i].publicKey">
            </el-input>
          </el-row>
        </div>

        <!-- program -->
        <div class="param-pg" v-if="p.type=='Program'&&(paramAnswer!=null)">
          <el-row>
            <el-radio-group v-model="paramAnswer[i].pgType">
              <el-radio :label="$t('Lock.GenPg')">
                {{$t('Lock.GenPg')}}
              </el-radio>
              <el-radio :label="$t('Lock.InputPg')">
                {{$t('Lock.InputPg')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="paramAnswer[i].pgType==$t('Lock.GenPg')">
            <el-col :span="6">
              <div>{{ $t('Lock.Account')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="paramAnswer[i].alias" :placeholder="$t('Lock.SelectAccount')">
                <el-option :label="al" :value="al" v-for="al in alias" :key="al"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="paramAnswer[i].program">
            </el-input>
          </el-row>
        </div>

        <!-- amount -->
        <div class="param-am" v-if="p.type=='Amount'&&(paramAnswer!=null)">
          <el-row type="flex" align="middle">
            <el-col :span="6">
              <div>{{ $t('Lock.Amount')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-input v-model="paramAnswer[i].amount"></el-input>
            </el-col>
          </el-row>
        </div>

        <!-- Asset -->
        <div class="param-as" v-if="p.type=='Asset'&&(paramAnswer!=null)">
          <el-row>
            <el-radio-group v-model="paramAnswer[i].assetType">
              <el-radio :label="$t('Lock.SelectAsset')">
                {{$t('Lock.SelectAsset')}}
              </el-radio>
              <el-radio :label="$t('Lock.InputAssetID')">
                {{$t('Lock.InputAssetID')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="paramAnswer[i].assetType==$t('Lock.SelectAsset')">
            <el-col :span="6">
              <div>{{ $t('Lock.Asset')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="paramAnswer[i].asset_alias" :placeholder="$t('Lock.SelectAsset')"
                @change="selectAsset">
                <el-option :label="a" :value="a" v-for="a in assets" :key="a"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="paramAnswer[i].asset_id" :placeholder="$t('Lock.InputAssetID')"></el-input>
          </el-row>
        </div>

        <!-- others -->
        <div class="param-am"
          v-if="(p.type=='Boolean'||p.type=='Integer'||p.type=='Hash'||p.type=='String')&&(paramAnswer!=null)">
          <el-row type="flex" align="middle">
            <el-col :span="6">
              <div>{{ $t('Lock.Value')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-input v-model="paramAnswer[i].value"></el-input>
            </el-col>
          </el-row>
        </div>

      </div>
    </div>
    <el-row>
      <el-button style="width: 100%" @click="submit">{{ $t('Lock.LockAsset')}}</el-button>
    </el-row>
    <el-row v-if="controlProgram&&controlProgram.length">
      <el-col :span="8">
        <div>{{ $t('Lock.ContractProgram')}}</div>
      </el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ controlProgram}}</div>
      </el-col>
    </el-row>
    <el-row v-if="txid&&txid.length">
      <el-col :span="8">{{ $t('Lock.Txid')}}</el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ txid }}</div>
      </el-col>
    </el-row>
    <el-row v-if="utxoid&&utxoid.length">
      <el-col :span="8">{{ $t('Lock.Utxoid')}}</el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ utxoid }}</div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import {
    sleep,
  } from "../utils/util.js"
  import {
    Bytom
  } from "../utils/bytom.js"
  import {
    readUploadFile
  } from "../utils/reader.js"
  import {
    Namespace
  } from "../common/const.js"
  export default {
    name: 'lock',
    components: {},
    data() {
      return {
        netType: '',
        netAddr: 'http://',
        bytom: null,
        walletFileName: '',
        lockof: false,
        lockAsset: '',
        lockAssetId: '',
        lockAccount: '',
        assetFrom: '',
        lockAssetAmount: '',
        avaliableAssetAmount: 0,
        accountPassword: '',
        gas: 0,
        gasType: 'BTM',
        params: null,
        paramAnswer: null,
        controlProgram: '',
        txid: '',
        utxoid: '',
      }
    },
    watch: {
      netAddr(newNetAddr) {
        //TODO: replace by change event
        this.bytom.setNet(newNetAddr)
      },
      async lockAssetId(newAssetId) {
        if (!newAssetId || newAssetId.length != 64) {
          return
        }
        let ret = await this.bytom.listBalances(this.lockAccount).catch((e) => {})
        if (!ret || !ret.length) {
          return
        }
        for (let a of ret) {
          if (a.asset_id != this.lockAssetId) {
            continue
          }
          this.avaliableAssetAmount = a.amount
          break
        }
      }
    },
    computed: {
      alias() {
        return this.$store.state[Namespace.USER].alias
      },
      assets() {
        return this.$store.state[Namespace.USER].assets
      },
    },
    created() {
      this.netType = this.$t('Lock.MainNet')
      this.bytom = new Bytom()
      this.bytom.setNet("http://localhost:9888/")
      this.assetFrom = this.$t('Lock.SelectAsset')
    },
    methods: {
      async init() {
        this.params = null
        this.lockof = false
        this.paramAnswer = null

        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        if (!code.length) {
          return
        }
        let left = code.indexOf("{")
        if (left == -1) {
          return
        }
        let firstline = code.substring(0, left)
        this.lockof = (firstline.indexOf("locks") != -1 && firstline.indexOf("of") != -1)
        if (this.lockof) {
          let assets = await this.bytom.listAssets().catch((e) => {})
          if (!assets || !assets.length) {
            return
          }
          let assetAlias = []
          let assetObj = {}
          for (let a of assets) {
            assetAlias.push(a.alias)
            assetObj[a.alias] = a.id
          }
          this.$store.commit(`${Namespace.USER}/setAssets`, assetAlias)
          this.$store.commit(`${Namespace.USER}/setAssetObj`, assetObj)
        }
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
        this.params = []
        this.paramAnswer = []
        for (let pair of paramPairs) {
          if (pair.indexOf(":") == -1) {
            continue
          }
          let valueType = pair.split(":")
          this.params.push({
            name: valueType[0].trim(),
            type: valueType[1].trim(),
          })
          switch (valueType[1].trim()) {
            case "PublicKey":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  pkType: this.$t('Lock.GenPk'),
                  alias: '',
                  publicKey: '',
                })
                break
              }
            case "Program":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  pgType: this.$t('Lock.GenPg'),
                  alias: '',
                  program: '',
                })
                break
              }
            case "Amount":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  pgType: this.$t('Lock.Amount'),
                  amount: 0,
                })
                break
              }
            case "Asset":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  assetType: this.$t('Lock.SelectAsset'),
                  asset_alias: '',
                  asset_id: '',
                })
                break
              }
            case "Boolean":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  value: false,
                })
                break
              }
            case "Integer":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  value: 0,
                })
                break
              }
            case "Hash":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  value: '',
                })
                break
              }
            case "String":
              {
                this.paramAnswer.push({
                  type: valueType[1].trim(),
                  value: '',
                })
                break
              }
            default:
              this.paramAnswer.push({})
              break
          }
        }
      },
      async handleUpload(event, file, fileList) {
        if (!file || !file.hasOwnProperty("name")) {
          this.$message(this.$t("AlertMessage.FileError"))
          return
        }
        let wallImageObj = null
        try {
          const fileContent = await readUploadFile(file)
          this.walletFileName = file["name"]
          const fileObj = JSON.parse(fileContent)
          if (fileObj.data && fileObj.data.account_image) {
            if (!file.data.account_image.slices || !file.data.account_image.slices.length) {
              this.$message(this.$t("Lock.NoAccount"))
              return
            }
            wallImageObj = fileObj.data
          } else if (fileObj.account_image) {
            if (!fileObj.account_image.slices || !fileObj.account_image.slices.length) {
              this.$message(this.$t("Lock.NoAccount"))
              return
            }
            wallImageObj = fileObj
          } else {
            throw "wallet image not found"
          }
        } catch (e) {
          this.$message(this.$t("AlertMessage.FileError"))
        }
        let restoreWalletRet = await this.bytom.restoreWallet(JSON.stringify(wallImageObj)).catch((e) => {})
        let aliases = []
        for (let acc of wallImageObj.account_image.slices) {
          let listAccRet = await this.bytom.listAccounts(acc.account.alias).catch((e) => {})
          if (!listAccRet) {
            continue
          }
          aliases.push(acc.account.alias)
        }
        this.$store.commit(`${Namespace.USER}/setAlias`, aliases)
      },
      handleUploadExceed(file, fileList) {
        this.$message(this.$t("AlertMessage.UploadTooMuch", {
          max: 1
        }))
      },
      selectNetType(n) {
        switch (n) {
          case this.$t('Lock.MainNet'):
            {
              this.bytom.setNet("http://localhost:9888/")
              break
            }
          case this.$t('Lock.TestNet'):
            {
              this.bytom.setNet("http://localhost:9888/")
              break
            }
          case this.$t('Lock.CustomNet'):
            {
              break
            }
        }
      },
      async selectAsset() {
        if (!this.lockAccount || !this.lockAccount.length) {
          return
        }
        let ret = await this.bytom.listBalances(this.lockAccount).catch((e) => {})
        if (!ret || !ret.length) {
          return
        }
        for (let a of ret) {
          if (a.asset_alias != this.lockAsset) {
            continue
          }
          this.avaliableAssetAmount = a.amount
          break
        }
      },
      async submit() {
        this.lockAccount = "test"
        this.lockAsset = "BILL"
        this.lockAssetAmount = "90000000"
        this.accountPassword = "123456"
        this.gas = "1"
        this.gasType = "BTM"
        this.paramAnswer = JSON.parse(
          '[{"type":"Asset","assetType":"Select Asset","asset_alias":"BILL","asset_id":""},{"type":"Amount","pgType":"Amount","amount":"90000000"},{"type":"Program","pgType":"Generate Program","alias":"test","program":""},{"type":"PublicKey","pkType":"Generate PublicKey","alias":"test","publicKey":""}]'
        )

        if (!this.lockAccount || (!this.lockAsset && !this.lockAssetId) || !this.lockAssetAmount || !this
          .accountPassword || !this.gas || !this.gasType) {
          this.$message(this.$t('Request.ParamMiss'))
          return
        }
        if (this.params && this.params.length && (!this.paramAnswer || !this.paramAnswer.length)) {
          this.$message(this.$t('Request.ParamMiss'))
          return
        }
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        if (!code.length) {
          return
        }

        let acc = await this.bytom.listAccounts(this.lockAccount).catch((e) => {})
        if (!acc || !acc.length) {
          return
        }
        let args = []
        for (let param of this.paramAnswer) {
          if (param.type == 'Boolean') {
            args.push({
              boolean: param.value
            })
            continue
          }
          if (param.type == 'Integer' || param.type == 'Amount') {
            args.push({
              integer: parseInt(param.amount)
            })
            continue
          }

          if (param.type == 'String' || param.type == 'Hash') {
            args.push({
              string: param.value
            })
            continue
          }

          if (param.type == 'Asset' && param.asset_id) {
            args.push({
              string: asset_id
            })
            continue
          }
          if (param.type == 'Asset' && param.asset_alias) {
            args.push({
              string: this.$store.state[Namespace.USER].assetObj[param.asset_alias]
            })
            continue
          }

          if (param.type == 'Program' && param.program) {
            args.push({
              string: param.program
            })
            continue
          }
          if (param.type == 'Program' && param.alias) {
            let newReceiver = await this.bytom.createReceiver(param.alias, acc[0].id)
            if (!newReceiver) {
              continue
            }
            args.push({
              string: newReceiver['control_program']
            })
            continue
          }
          if (param.type == 'PublicKey' && param.publicKey) {
            args.push({
              string: param.publicKey
            })
            continue
          }
          if (param.type == 'PublicKey' && param.alias) {
            let newPublicKey = await this.bytom.listPubkeys(acc[0].id)
            if (!newPublicKey || !newPublicKey.hasOwnProperty('pubkey_infos') || newPublicKey['pubkey_infos']
              .length == 0) {
              continue
            }
            let pk = newPublicKey['pubkey_infos'][0].pubkey
            args.push({
              string: pk
            })
            continue
          }
        }
        if (args.length != this.paramAnswer.length) {
          return
        }
        let compileRet = await this.bytom.compile(code, args).catch((e) => {})
        if (!compileRet) {
          return
        }

        this.controlProgram = compileRet.program
        let bytomFee = 0
        switch (this.gasType) {
          case "BTM":
            {
              bytomFee = parseInt(parseFloat(this.gas) * 100000000)
              break
            }
          case "mBTM":
            {
              bytomFee = parseInt(parseFloat(this.gas) * 1000)
              break
            }
          case "NEU":
            {
              bytomFee = parseInt(this.gas)
              break
            }
        }
        if (this.lockAssetId == '') {
          this.lockAssetId = this.$store.state[Namespace.USER].assetObj[this.lockAsset]
        }
        let txid = await this.bytom.lock(acc[0].id, this.accountPassword, bytomFee, parseInt(this.lockAssetAmount),
          this.lockAssetId, code, args).catch((e) => {
          this.$message(this.$t('Lock.SubmitFailed'))
        })
        if (!txid) {
          this.$message(this.$t('Lock.SubmitFailed'))
          return
        }
        this.txid = txid
        this.$message(this.$t('Lock.SubmitSuccess'))
        this.utxoid = this.$t('Lock.WaitForTx')
        for (let i = 0; i < 60; i++) {
          let confirmed = await this.bytom.isTxConfirmed(this.txid)
          if (confirmed) {
            break
          }
          await sleep(1000)
        }
        this.utxoid = await this.bytom.fintUTXOId(this.txid, this.controlProgram).catch((e) => {
          console.log('utxoid err', e)
        })
        if (!this.utxoid) {
          return
        }
        this.$emit('submit', this.utxoid)
      }
    }
  }

</script>

<style scoped>
  .el-row {
    padding-bottom: 12px;
    padding-top: 12px;
  }

  .el-col {
    word-break: break-all;
  }

  .middle-fontsize {
    font-size: 11pt;
  }

</style>
