<template>
  <div class="lock-pane" v-if="!isLogin">
    {{ $t('Lock.UseByonePrompt')}}
  </div>
  <div class="unlock-pane" v-loading="loading" v-else>
    <el-row type="flex" align="middle">
      <el-col :span="6">
        <div>{{ $t('Lock.Utxoid')}}:</div>
      </el-col>
      <el-col :span="18">
        <el-input v-model="utxoid"></el-input>
      </el-col>
    </el-row>
    <el-row class="bottom-line">
      <el-button @click="findUtxo" class="full-btn">{{$t('Unlock.Find')}}</el-button>
    </el-row>

    <!-- lock asset -->
    <div class="lock-asset bottom-line" v-if="ast&&ast.value">
      <el-row class="section-title ">
        {{ $t('Lock.LockAsset')}}:
      </el-row>
      <el-row>{{ ast ? ast.value.amount : ''}} of {{ ast ? ast.value.asset : ''}}: Value</el-row>
      <el-row>
        <el-input v-model="utxo.asset_alias" disabled>
          <template slot="prepend">{{$t('Lock.Asset')}}</template>
        </el-input>
      </el-row>
      <el-row>
        <el-input v-model="utxo.amount" disabled>
          <template slot="prepend">{{$t('Lock.Amount')}}</template>
        </el-input>
      </el-row>
    </div>

    <!-- params -->
    <div class="contract-params bottom-line" v-show="args&&args.length&&ast&&ast.params">
      <el-row>
        {{ $t('Lock.ContractParameters')}}:
      </el-row>
      <el-row type="flex" align="middle" v-for="(arg, idx) in args" :key="idx">
        <el-col :span="8">
          <div style="word-break:break-all;">
            {{ ast != null ? ast.params[idx].name : ''}}:{{ ast != null ? ast.params[idx].type : ''}}</div>
        </el-col>
        <el-col :span="16">
          <div style="word-break:break-all;">{{ arg[Object.keys(arg)[0]] }} </div>
        </el-col>
      </el-row>
    </div>

    <!-- clause -->
    <el-row type="flex" align="middle" v-show="clauses.length">
      <el-col :span="6">{{$t('Unlock.UnlockClause')}}</el-col>
      <el-col :span="18">
        <el-select v-model="unlock.clause" @change="changeClause">
          <el-option :label="cl" :value="cl" v-for="cl in clauses" :key="cl"></el-option>
        </el-select>
      </el-col>
    </el-row>

    <!-- clause required value -->
    <el-row v-if="unlock.required&&unlock.required.length"></el-row>
    <div class="clause-required-value bottom-line" v-for="(v,i) in unlock.required">
      <el-row>{{v.clauseAsset}}: {{v.clauseAmount}}</el-row>
      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.Account')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="unlock.required[i].accountAlias" :placeholder="$t('Lock.SelectAccount')">
            <el-option :label="a" :value="a" v-for="a in alias" :key="a"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-input :value="requiredAssetAlias(v,i)" disabled>
          <template slot="prepend">{{$t('Lock.Asset')}}</template>
        </el-input>
      </el-row>
      <el-row>
        <el-input :value="requiredAssetAmount(v,i)" disabled>
          <template slot="prepend">{{$t('Lock.Amount')}}</template>
        </el-input>
        <!-- TODO: show avaliable -->
      </el-row>
    </div>

    <!-- clause params -->
    <el-row v-if="unlock.params&&unlock.params.length">
      {{$t('Unlock.ClauseParms')}}</el-row>
    <div class="clause-params bottom-line" v-for="(p,i) in  unlock.params">
      <div class="clause-params-sig" v-if="p.type=='Signature'">
        <el-row>{{p.name}}: {{p.type}}</el-row>
        <el-row type="flex" align="middle">
          <el-col :span="6">
            <div>{{ $t('Lock.Account')}}:</div>
          </el-col>
          <el-col :span="18">
            <el-select v-model="unlock.params[i].value" :placeholder="$t('Lock.SelectAccount')">
              <el-option :label="a" :value="a" v-for="a in alias" :key="a"></el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
      <div v-else>
        <el-row>
          <el-input v-model="unlock.params[i].value" :placeholder="p.name"></el-input>
        </el-row>
      </div>
    </div>

    <!-- unlock asset -->
    <div class="unlock-Asset" v-if="ast&&ast.value">
      <el-row>{{$t('Unlock.UnlockAssetTarget')}}:</el-row>
      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.Account')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="unlock.account" :placeholder="$t('Lock.SelectAccount')">
            <el-option :label="a" :value="a" v-for="a in alias" :key="a"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-input v-model="utxo.asset_alias" disabled>
          <template slot="prepend">{{$t('Lock.Asset')}}</template>
        </el-input>
      </el-row>
      <el-row>
        <el-input v-model="utxo.amount" disabled>
          <template slot="prepend">{{$t('Lock.Amount')}}</template>
        </el-input>
      </el-row>
      <!-- <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.AccountPassword')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input type="password" v-model="unlock.password" :placeholder="$t('Lock.AccountPasswordPrompt')">
          </el-input>
        </el-col>
      </el-row> -->

      <el-row type="flex" align="middle" style="border-bottom:1px solid; border-bottom-color: rgb(220, 223, 230); ">
        <el-col :span="6">
          <div>{{ $t('Lock.Gas')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input v-model="unlock.gas" :placeholder="$t('Lock.GasPrompt')" class="input-with-select">
            <el-select v-model="unlock.gasType" slot="append" :placeholder="$t('Lock.GasPrompt')" style="width: 6vw;">
              <el-option :label="gt" :value="gt" v-for='gt in ["BTM", "mBTM", "NEU"]' :key="gt"></el-option>
            </el-select>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <el-row class="bottom-line" v-if="utxo&&utxo.id">
      <el-button @click="submit" class="full-btn">{{$t('Unlock.Unlock')}}</el-button>
    </el-row>

    <el-row v-if="txid&&txid.length">
      <el-col :span="8">{{ $t('Lock.Txid')}}</el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ txid }}</div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import * as analyzer from "../models/analyzer.js"
  import {
    Namespace
  } from "../common/const.js"
  import {
    BytomAPI
  } from "../models/byone.js"
  import {
    calculateBytomFee
  } from "../utils/util.js"
  export default {
    name: 'unlock',
    components: {},
    data() {
      return {
        loading: false,
        utxoid: '',
        utxo: null,
        bytomAPI: null,
        args: [],
        ast: null,
        clauses: [],
        unlock: {},
        txid: null,
      }
    },

    computed: {
      alias() {
        return this.$store.state[Namespace.USER].alias
      },
      isLogin() {
        return this.$store.state[Namespace.USER].isLogin
      }
    },
    created() {
      this.bytomAPI = new BytomAPI()
    },
    methods: {
      init() {
        this.args = []
        this.ast = null
        this.utxo = null
        this.unlock = {
          args: [],
          clause: '',
          account: '',
          password: '',
          gas: 0,
          gasType: 'BTM',
          params: [],
          required: [],
        }
        this.txid = null
      },
      setUtxoid(utxoid) {
        this.utxoid = utxoid
      },

      async findUtxo() {
        this.init()
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        if (!code.length) {
          this.$message(this.$t('Unlock.CodeIsEmpty'))
          return
        }
        this.loading = true
        try {
          let current = await this.bytomAPI.currentAccount()
          let utxo = await this.bytomAPI.getUtxoFromId(current.guid,
            this.utxoid)
          this.utxo = analyzer.inheritUtxo(utxo, this.$store.state[Namespace.USER].assets)
        } catch (e) {
          console.log('[ERROR] bytom api request err', e)
          this.$message(this.$t('Unlock.DecodeFailed'))
        }
        this.loading = false
        let instructions = await this.bytomAPI.decodeProgram(this.utxo.program).catch((e) => {
          console.log('[ERROR] decode program', err)
        })
        if (!instructions) {
          return
        }
        let decodedResult = analyzer.decodeInstructions(instructions)
        let byteCode = decodedResult.byteCode
        this.args = decodedResult.args
        const astRet = await this.$http.post(`compile/ast`, {
          Code: code
        })
        if (astRet.body.status != "success") {
          this.$message({
            message: astRet.body.error_detail,
            duration: 5000
          })
          return
        }
        let astObj = JSON.parse(`{ ${astRet.body.data.ast} }`)
        if (astObj.Ast.body_bytecode != byteCode) {
          this.$message(this.$t('Unlock.CodeIsWrong'))
          return
        }
        this.ast = astObj.Ast
        for (let i in this.ast.params) {
          let astParam = this.ast.params[i]
          this.unlock.args.push({
            name: astParam.name,
            type: astParam.type,
            value: this.args[i][Object.keys(this.args[i])[0]]
          })
        }

        for (let cl of this.ast.clauses) {
          if (this.unlock.clause == '') {
            this.unlock.clause = cl.name
          }
          this.clauses.push(cl.name)
        }
        this.setUnlockPropertiesOfClause()
      },
      setUnlockPropertiesOfClause() {
        // set params for unlock clause
        this.unlock.params = []
        this.unlock.required = []
        if (this.ast == null) {
          return
        }
        let clauseObj = this.ast.clauses[this.clauses.indexOf(this.unlock.clause)]
        if (clauseObj == null) {
          return
        }

        if (clauseObj.params) {
          for (let p of clauseObj.params) {
            this.unlock.params.push({
              name: p.name,
              type: p.type,
              value: '',
            })
          }
        }
        if (clauseObj.values) {
          for (let v of clauseObj.values) {
            if (!v.hasOwnProperty('program')) {
              continue
            }
            let program = ''
            for (let arg of this.unlock.args) {
              if (arg.type == 'Program' && arg.name == v.program) {
                program = arg.value
                break
              }
            }
            this.unlock.required.push({
              program: program,
              clauseAsset: v.asset,
              clauseAmount: v.amount,
              assetId: '',
              amount: 0,
              accountAlias: '',
            })
          }
        }
      },
      getAssetAliasById(id) {
        for (let asset_alias in this.$store.state[Namespace.USER].assetObj) {
          if (this.$store.state[Namespace.USER].assetObj[asset_alias] != id) {
            continue
          }
          return asset_alias
        }
        return ''
      },
      requiredAssetAlias(v, idx) {
        if (this.args.length != this.ast.params.length) {
          return
        }
        for (let i in this.ast.params) {
          let p = this.ast.params[i]
          if (p.name != v.clauseAsset) {
            continue
          }
          let arg = this.args[i]
          let assetId = arg[Object.keys(arg)[0]]
          let unlockRequired = this.unlock.required[idx]
          unlockRequired.assetId = assetId
          return this.getAssetAliasById(assetId)
        }
        if (this.ast.value && this.ast.value.asset == v.clauseAsset) {
          let unlockRequired = this.unlock.required[idx]
          unlockRequired.assetId = this.utxo.asset_id
          return this.getAssetAliasById(this.utxo.asset_id)
        }
        return null
      },
      requiredAssetAmount(v, idx) {
        if (this.args.length != this.ast.params.length) {
          return
        }
        for (let i in this.ast.params) {
          let p = this.ast.params[i]
          if (p.name != v.clauseAmount) {
            continue
          }
          let arg = this.unlock.args[i]
          let unlockRequired = this.unlock.required[idx]
          unlockRequired.amount = arg.value
          return arg.value
        }
        if (this.ast.value && this.ast.value.amount == v.clauseAmount) {
          let unlockRequired = this.unlock.required[idx]
          unlockRequired.amount = this.utxo.amount
          return this.utxo.amount
        }
        return null
      },
      changeClause() {
        this.setUnlockPropertiesOfClause()
      },
      async submit() {
        let bytomFee = calculateBytomFee(this.unlock.gasType, this.unlock.gas)
        let resp = await this.bytomAPI.unlock(this.utxo, this.clauses.indexOf(this.unlock.clause), this.unlock,
          bytomFee).catch((e) => {
          console.log('[ERROR] unlock err', e)
          this.$message(this.$t('Unlock.SubmitFailed'))
        })
        if (!resp || resp.action != "success") {
          this.$message(this.$t('Unlock.SubmitFailed'))
          return
        }
        if (resp.message.code != 200) {
          this.$message(resp.message.msg)
          return
        }
        this.$message(this.$t('Unlock.SubmitSuccess'))
        this.txid = resp.message.result.data.transaction_hash
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

  .section-title {
    /* font-size: 14pt; */
    /* font-weight: bold; */
  }

  .bottom-line {
    border-bottom: 1px solid;
    border-bottom-color: rgb(220, 223, 230);
  }

  .full-btn {
    width: 100%;
  }

</style>
