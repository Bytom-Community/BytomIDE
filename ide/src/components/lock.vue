<template>
  <div class="lock-pane" v-if="!isLogin">
    {{ $t('Lock.UseByonePrompt')}}
  </div>
  <div class="lock-pane" v-else>
    <div class="lockof" v-show="lock.lockof">
      <el-row>
        {{ $t('Lock.LockAsset')}}:
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.Account')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="lock.lockAlias" :placeholder="$t('Lock.SelectAccount')">
            <el-option :label="a" :value="a" v-for="a in alias" :key="a"></el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-radio-group v-model="lock.lockAsset.inputType">
          <el-radio :label="ParamInputType.SelectAsset">
            {{$t('Lock.SelectAsset')}}
          </el-radio>
          <el-radio :label="ParamInputType.InputAsset">
            {{$t('Lock.InputAssetID')}}
          </el-radio>
        </el-radio-group>
      </el-row>
      <el-row type="flex" align="middle" v-if="lock.lockAsset.inputType == ParamInputType.SelectAsset">
        <el-col :span="6">
          <div>{{ $t('Lock.Asset')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-select v-model="lock.lockAsset.alias" :placeholder="$t('Lock.SelectAsset')" @change="selectAsset">
            <el-option :label="a.alias" :value="a.alias" v-for="a in assetsForLock" :key="a.id"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-input v-model="lock.lockAsset.id" :placeholder="$t('Lock.InputAssetID')" @input="selectAsset">
        </el-input>
      </el-row>

      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.LockAssetAmount')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input v-model="lock.lockAsset.amount" :placeholder="$t('Lock.LockAssetAmountPrompt')"></el-input>
        </el-col>
      </el-row>
      <el-row type="flex" justify="end" style="font-size: 10pt;">
        {{lock.lockAsset.avaliable}} {{ $t('Lock.AssetAvaliable')}}
      </el-row>
      <!-- 
      <el-row type="flex" align="middle">
        <el-col :span="6">
          <div>{{ $t('Lock.AccountPassword')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input type="password" v-model="accountPassword" :placeholder="$t('Lock.AccountPasswordPrompt')">
          </el-input>
        </el-col>
      </el-row> -->

      <el-row type="flex" align="middle" style="border-bottom:1px solid; border-bottom-color: rgb(220, 223, 230); ">
        <el-col :span="6">
          <div>{{ $t('Lock.Gas')}}:</div>
        </el-col>
        <el-col :span="18">
          <el-input v-model="lock.gas" :placeholder="$t('Lock.GasPrompt')" class="input-with-select">
            <el-select v-model="lock.gasType" slot="append" :placeholder="$t('Lock.GasPrompt')" style="width: 6vw;">
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
        <div class="param-pk" v-if="p.type == ParamType.PublicKey && lock.paramAnswer">
          <el-row>
            <el-radio-group v-model="lock.paramAnswer[i].inputType">
              <el-radio :label="ParamInputType.GeneratePublicKey">
                {{$t('Lock.GenPk')}}
              </el-radio>
              <el-radio :label="ParamInputType.InputPublicKey">
                {{$t('Lock.InputPk')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="lock.paramAnswer[i].inputType == ParamInputType.GeneratePublicKey">
            <el-col :span="6">
              <div>{{ $t('Lock.Account')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="lock.paramAnswer[i].alias" :placeholder="$t('Lock.SelectAccount')">
                <el-option :label="al" :value="al" v-for="al in alias" :key="al"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="lock.paramAnswer[i].publicKey">
            </el-input>
          </el-row>
        </div>

        <div class="param-pg" v-if="p.type == ParamType.Program && lock.paramAnswer">
          <el-row>
            <el-radio-group v-model="lock.paramAnswer[i].inputType">
              <el-radio :label="ParamInputType.GenerateProgram">
                {{$t('Lock.GenPg')}}
              </el-radio>
              <el-radio :label="ParamInputType.InputProgram">
                {{$t('Lock.InputPg')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="lock.paramAnswer[i].inputType == ParamInputType.GenerateProgram">
            <el-col :span="6">
              <div>{{ $t('Lock.Account')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="lock.paramAnswer[i].alias" :placeholder="$t('Lock.SelectAccount')">
                <el-option :label="al" :value="al" v-for="al in alias" :key="al"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="lock.paramAnswer[i].program">
            </el-input>
          </el-row>
        </div>

        <!-- amount -->
        <div class="param-am" v-if="p.type == ParamType.Amount && lock.paramAnswer">
          <el-row type="flex" align="middle">
            <el-col :span="6">
              <div>{{ $t('Lock.Amount')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-input v-model="lock.paramAnswer[i].amount"></el-input>
            </el-col>
          </el-row>
        </div>

        <!-- Asset -->
        <div class="param-as" v-if="p.type == ParamType.Asset && lock.paramAnswer">
          <el-row>
            <el-radio-group v-model="lock.paramAnswer[i].inputType">
              <el-radio :label="ParamInputType.SelectAsset">
                {{$t('Lock.SelectAsset')}}
              </el-radio>
              <el-radio :label="ParamInputType.InputAsset">
                {{$t('Lock.InputAssetID')}}
              </el-radio>
            </el-radio-group>
          </el-row>
          <el-row type="flex" align="middle" v-if="lock.paramAnswer[i].inputType == ParamInputType.SelectAsset">
            <el-col :span="6">
              <div>{{ $t('Lock.Asset')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-select v-model="lock.paramAnswer[i].asset_alias" :placeholder="$t('Lock.SelectAsset')">
                <el-option :label="a.alias" :value="a" v-for="a in assetsForLock" :key="a.id"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-input v-model="lock.paramAnswer[i].asset_id" :placeholder="$t('Lock.InputAssetID')"></el-input>
          </el-row>
        </div>

        <!-- others -->
        <div class="param-am"
          v-if="(p.type == ParamType.Boolean || p.type == ParamType.Integer || p.type == ParamType.Hash || p.type == ParamType.String) && lock.paramAnswer">
          <el-row type="flex" align="middle">
            <el-col :span="6">
              <div>{{ $t('Lock.Value')}}:</div>
            </el-col>
            <el-col :span="18">
              <el-input v-model="lock.paramAnswer[i].value"></el-input>
            </el-col>
          </el-row>
        </div>

      </div>
    </div>
    <el-row>
      <el-button style="width: 100%" @click="submit">{{ $t('Lock.LockAsset')}}</el-button>
    </el-row>
    <el-row v-if="lockResult.controlProgram && lockResult.controlProgram.length">
      <el-col :span="8">
        <div>{{ $t('Lock.ContractProgram')}}</div>
      </el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ lockResult.controlProgram}}</div>
      </el-col>
    </el-row>
    <el-row v-if="lockResult.txid&&lockResult.txid.length">
      <el-col :span="8">{{ $t('Lock.Txid')}}</el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ lockResult.txid }}</div>
      </el-col>
    </el-row>
    <el-row v-if="lockResult.utxoid&&lockResult.utxoid.length">
      <el-col :span="8">{{ $t('Lock.Utxoid')}}</el-col>
      <el-col :span="16">
        <div style="word-break:break-all;">{{ lockResult.utxoid }}</div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import {
    sleep,
    calculateBytomFee
  } from "../utils/util.js"
  import {
    Bytom
  } from "../utils/bytom.js"
  import {
    readUploadFile
  } from "../utils/reader.js"
  import {
    Namespace,
    ParamInputType,
    ParamType
  } from "../common/const.js"
  import {
    BytomAPI,
    testLock
  } from "../models/byone.js"
  import * as analyzer from "../models/analyzer.js"
  export default {
    name: 'lock',
    components: {},
    data() {
      return {
        ParamInputType: ParamInputType, // const type
        ParamType: ParamType, // const type
        bytomAPI: null, // api instance
        params: null, // params parsed from code
        lock: {
          lockAlias: '', // lock account alias
          lockof: false, // need lock asset or not
          lockAsset: {
            inputType: ParamInputType.SelectAsset,
            id: '',
            alias: '',
            avaliable: 0,
            amount: 0,
          },
          paramAnswer: null, // input or generate params values
          gas: 0,
          gasType: 'BTM',
        },
        lockResult: {
          controlProgram: '',
          txid: '',
          utxoid: '',
        }
      }
    },
    computed: {
      alias() {
        return this.$store.state[Namespace.USER].alias
      },
      assetsForLock() {
        let all = this.$store.state[Namespace.USER].assets
        let canLockAssets = []
        for (let a of all) {
          if (a.alias && a.alias.toLowerCase() == "btm") {
            continue
          }
          canLockAssets.push(a)
        }
        return canLockAssets
      },
      isLogin() {
        return this.$store.state[Namespace.USER].isLogin
      }
    },
    async created() {
      this.assetFrom = this.$t('Lock.SelectAsset')
      this.bytomAPI = new BytomAPI()
    },
    methods: {
      async init() {
        this.params = null
        this.lock = {
          lockAlias: '', // lock account alias
          lockof: false, // need lock asset or not
          lockAsset: {
            inputType: ParamInputType.SelectAsset,
            id: '',
            alias: '',
            avaliable: 0,
            amount: 0,
          },
          paramAnswer: null,
          gas: 0,
          gasType: 'BTM',
        }
        this.lockResult = {
          controlProgram: '',
          txid: '',
          utxoid: '',
        }
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        if (!code.length) {
          return
        }
        this.lock.lockof = analyzer.needLockAsset(code)
        this.params = analyzer.parseParams(code)
        this.lock.paramAnswer = analyzer.makeParamAnswers(this.params)
      },
      async selectAsset(v) {
        this.lock.lockAsset.avaliable = 0
        if (!this.lock.lockAlias || !this.lock.lockAlias.length) {
          return
        }
        let guid = await this.bytomAPI.getGuid(this.lock.lockAlias).catch((e) => {
          console.log('[ERROR] get guid err', e)
          return
        })

        if ((!this.lock.lockAsset.id || !this.lock.lockAsset.id.length) &&
          this.lock.lockAsset.inputType == ParamInputType.SelectAsset) {
          let all = this.$store.state[Namespace.USER].assets
          for (let a of all) {
            if (a.alias == this.lock.lockAsset.alias) {
              this.lock.lockAsset.id = a.id
              break
            }
          }
        }
        let ret = await this.bytomAPI.getBalance(guid, this.lock.lockAsset.id).catch((e) => {
          console.log('[ERROR] get balance err', e)
          return
        })
        if (ret) {
          this.lock.lockAsset.avaliable = ret
        }
      },
      async submit() {
        if (!this.lock.lockAlias || (!this.lock.lockAsset && !this.lock.lockAsset.id) || this.lock.lockAsset.amount ==
          0 || !this.lock.gas || !this.lock.gasType) {
          this.$message(this.$t('Request.ParamMiss'))
          return
        }
        if (this.params && this.params.length && (!this.lock.paramAnswer || !this.lock.paramAnswer.length)) {
          this.$message(this.$t('Request.ParamMiss'))
          return
        }

        let current = await this.bytomAPI.currentAccount().catch((e) => {
          console.log('[ERROR] get current account failed', e)
        })
        if (this.lock.lockAlias != current.alias) {
          this.$message(this.$t('Request.WrongAccount'))
          return
        }
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        if (!code.length) {
          return
        }
        for (let param of this.lock.paramAnswer) {
          switch (param.type) {
            case ParamType.Asset: {
              if (!param.asset_alias || !param.asset_alias.length) {
                break
              }
              let all = this.$store.state[Namespace.USER].assets
              for (let a of all) {
                if (a.alias && a.alias.toLowerCase() == param.asset_alias) {
                  param.asset_id = a.id
                  break
                }
              }
              break
            }
            case ParamType.Program: {
              if (!param.alias || !param.alias.length) {
                break
              }
              // TODO: generate new receiver
              param.program = ''
              break
            }
            case ParamType.PublicKey: {
              if (!param.alias || !param.alias.length) {
                break
              }
              // TODO: generate public key
              param.publicKey = ''
              break
            }
          }
        }
        let args = analyzer.convertParamAnswerToArgs(this.lock.paramAnswer)
        if (args.length != this.lock.paramAnswer.length) {
          return
        }
        let codeToStr = code.replace(/\n/gm, ' ')
        let argValues = []
        for (let arg of args) {
          argValues.push(arg[Object.keys(arg)[0]])
        }
        const contractProgram = await this.bytomAPI.getInstance(codeToStr, argValues).catch((e) => {
          throw e
        })
        if (!contractProgram) {
          return
        }
        this.lockResult.controlProgram = contractProgram
        let bytomFee = calculateBytomFee(this.lock.gasType, this.lock.gas)
        if (this.lockAssetId == '') {
          this.lockAssetId = this.$store.state[Namespace.USER].assetObj[this.lockAsset]
        }
        let lockRet = await this.bytomAPI.lock(bytomFee, parseInt(this.lock.lockAsset.amount), this.lock.lockAsset.id,
            code,
            argValues)
          .catch((e) => {
            console.log("[ERROR] submit err ", e)
            this.$message(this.$t('Lock.SubmitFailed'))
          })
        if (!lockRet || lockRet.action != "success") {
          this.$message(this.$t('Lock.SubmitFailed'))
          return
        }
        if (lockRet.message.code != 200) {
          this.$message(lockRet.message.msg)
          return
        }
        this.lockResult.txid = lockRet.message.result.data.transaction_hash
        this.$message(this.$t('Lock.SubmitSuccess'))
        this.lockResult.utxoid = await this.bytomAPI.findUtxoid(this.lock.lockAsset.id, this.lockResult
          .controlProgram, this.lock.lockAsset.amount).catch((e) => {
          console.log('[ERROR] utxoid err', e)
        })
        if (!this.lockResult.utxoid) {
          return
        }
        this.$emit('submit', this.lockResult.utxoid)
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
