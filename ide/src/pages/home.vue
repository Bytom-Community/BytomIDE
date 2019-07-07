<template>
  <div class="home">
    <div class="folder-container" v-show="showFolder">
      <div class="folder-menu">
        <div class="menu-item" @click="newfile">
          <img src="../assets/plus.png" width="15px" height="15px" />
        </div>
        <div class="menu-item">
          <upload @onUpload="handleUpload">
            <template slot="upload-item">
              <img src="../assets/folder.png" width="16px" height="16px" />
            </template>
          </upload>
        </div>
        <div class="menu-item" @click="download">
          <img src="../assets/download.png" width="16px" height="16px" />
        </div>
        <div class="menu-item" @click="setting">
          <img src="../assets/settings.png" width="16px" height="16px" />
        </div>
      </div>
      <div class="folder">
        <folder style="height: 100%;" @remove="deSelect" @rename="onFileRenamed" @saveas="saveas"></folder>
      </div>
    </div>
    <div class="editor-container" :style="{width : showFolder ? '67%' : '80%'}">
      <div class="editor-header">
        <div class="editor-menu">
          <div class="editor-menu-arrow" @click="toggleFolder">
            <img src="../assets/arrowhead-left.png" alt="" style="width: 16px; height: 16px;" v-if="showFolder">
            <img src="../assets/arrowhead-right.png" alt="" style="width: 16px; height: 16px;" v-else>
          </div>
          <div class="editor-menu-font-size">
            <div @click="changeFontSize(true)"><img src="../assets/raw_plus.png" alt=""
                style="width: 12px; height: 12px;"></div>
            <div @click="changeFontSize(false)"><img src="../assets/raw_minus.png" alt=""
                style="width: 12px; height: 12px;"></div>
          </div>

        </div>
        <div class="breadcrumb" ref="breadcrumb">
          <div class="breadcrumb-item" v-for="name in selects" :class="{ 'breadcrumb-item-bold': isSelected(name) }">
            <span @click="select(name)">{{ name }}</span>
            <div @click="deSelect(name)"><img src="../assets/close.png" alt="" style="width: 12px; height: 12px;"></div>
          </div>
        </div>
      </div>
      <div :class="{ 'editor-normal': showConsole, 'editor-expand': !showConsole }">
        <editor style="width: 100%; height: 100%;"></editor>
      </div>

      <logview :class="{ 'console-expand': showConsole, 'console-hide': !showConsole }" @close="closeConsole">
      </logview>
    </div>
    <div class="tools">
      <el-tabs v-model="activeTab" type="border-card" @tab-click="handleClick" class="tool-tab">
        <el-tab-pane label="CLI" name="cli" class="tool-pane">
          <el-row type="flex" align="middle">
            <el-col :span="8"> <span>{{ $t('Tool.Operation') }}</span></el-col>
            <el-col :span="16">
              <el-select v-model="clicmd" :placeholder="$t('Tool.Command')" style="width:120px;" @change="cliret=''">
                <el-option label="bin" value="bin"></el-option>
                <el-option label="shift" value="shift"></el-option>
                <el-option label="instance" value="instance"></el-option>
                <el-option label="ast" value="ast"></el-option>
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <el-button @click="compile" style="width: 100%">{{ $t('Tool.Excute') }}</el-button>
          </el-row>
          <div class="tool-args" v-show="clicmd=='instance'">
            <span>{{ $t('Tool.Args') }}</span>
            <el-input class="tool-args-input" :placeholder="$t('Tool.InputArgs')" v-model="cliargs" clearable>
            </el-input>
          </div>
          <div class="tool-ret">
            <span>{{ $t('Tool.Result') }}</span>
            <el-input class="tool-ret-text" type="textarea" :autosize="{ minRows: 1, maxRows: 24}" v-model="cliret"
              :disabled="cliret.length==0"></el-input>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('Tool.Deploy')" name="deploy">
          <lock class="lock-pane" ref="lockPane" @submit="submitLockTx"></lock>
        </el-tab-pane>
        <el-tab-pane :label="$t('Tool.Run')" name="run">
          <unlock class="unlock-pane" ref="unlockPane"> </unlock>
        </el-tab-pane>
      </el-tabs>
    </div>

    <setting-dialog @cancel="cancelSetting" @confirm="confirmSetting" :isVisible="showSetting"></setting-dialog>
  </div>
</template>
<script>
  import editor from '../components/editor'
  import logview from "../components/log"
  import folder from "../components/tree"
  import settingDialog from "../components/setting"
  import upload from "../components/upload"
  import lock from "../components/lock"
  import unlock from "../components/unlock"
  import {
    Namespace,
    Common
  } from "../common/const.js"
  import {
    readUploadFile
  } from "../utils/reader.js"
  import {
    generateFileName
  } from "../utils/generator.js"
  import {
    sleep,
    Ticker
  } from "../utils/util.js"
  import {
    Logger
  } from "../utils/log.js"
  import {
    setFontSize,
    setTheme,
    setKeybinding
  } from "../ace/editor.js"
  import {
    User
  } from "../models/user.js"
  const config = require("../utils/config.js").config()
  let log
  export default {
    name: 'home',
    components: {
      editor,
      logview,
      folder,
      settingDialog,
      upload,
      lock,
      unlock
    },
    data() {
      return {
        showFolder: true,
        showSetting: false,
        activeTab: 'cli',
        clicmd: '',
        cliret: '',
        cliargs: '',
        codeTicker: null,
        showConsole: true,
      }
    },
    computed: {
      selects() {
        return this.$store.state[Namespace.PROJECT].selects
      },
    },
    async created() {
      log = new Logger(this.$store)
      this.createDemoFile()
      await this.initEditor()
      this.runSaveCodeTimer()
      let usrMgr = new User(this.$store)
      usrMgr.checkUsr()
    },
    methods: {
      createDemoFile() {
        const first = this.$store.state[Namespace.PROJECT].projects[0]
        if (first.children.length) {
          return
        }
        this.$store.commit(Namespace.PROJECT + '/newFile', {
          title: "demo.eqt",
          isLeaf: true,
          isSelected: true
        })
      },
      async initEditor() {
        let second = 0
        while (1) {
          if (second > Common.InitEditorTimeout) {
            break
          }
          second++
          if (this.$store.state[Namespace.EDITOR].editor == null) {
            await sleep(1000)
            continue
          }
          const editor = this.$store.state[Namespace.EDITOR].editor
          const setting = this.$store.state[Namespace.SETTING].setting
          if (setting.fontSize.length == 0) {
            this.$store.commit(Namespace.SETTING + '/init')
          } else {
            setFontSize(editor, setting.fontSize)
            setKeybinding(editor, setting.mode)
            setTheme(editor, setting.theme)
          }
          const currentFile = this.$store.state[Namespace.PROJECT].currentFile
          if (currentFile.length == 0) {
            return
          }
          this.updateEditor(currentFile)
          break
        }
      },
      newfile() {
        this.$prompt(this.$t('NewFile.Alert'), this.$t('NewFile.Prompt'), {
          confirmButtonText: this.$t('NewFile.Confirm'),
          cancelButtonText: this.$t('NewFile.Cancel'),
        }).then(({
          value
        }) => {
          if (value.length == 0) {
            this.$message(this.$t('AlertMessage.EmptyName'))
            return
          }
          let p = this.$store.state[Namespace.PROJECT].projects[0]
          let name = generateFileName(`${value}.eqt`, p)
          if (name.length == 0) {
            this.$message(this.$t('AlertMessage.DuplicatedFile'))
            return
          }
          this.$store.commit(Namespace.PROJECT + '/newFile', {
            title: name,
            isLeaf: true,
            isSelected: true
          })
          this.$store.commit(`${Namespace.PROJECT}/setCurrentFile`, name)
          this.updateEditor(name)
        }).catch(() => {})
      },
      updateEditor(file) {
        let code = this.$store.state[Namespace.PROJECT].codes[file]
        if (!code || code == undefined || !code.length) {
          code = ''
        }
        const session = this.$store.state[Namespace.EDITOR].editor.getSession()
        session.setValue(code)
      },
      commitCode() {
        let editor = this.$store.state[Namespace.EDITOR].editor
        if (editor == null) {
          return
        }
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        if (!currentFile || currentFile == undefined || currentFile.length == 0) {
          return
        }
        const session = editor.getSession()
        this.$store.commit(`${Namespace.PROJECT}/updateCode`, {
          name: currentFile,
          content: session.getValue(),
        })
      },
      runSaveCodeTimer() {
        let autoSave = this.$store.state[Namespace.SETTING].setting.autoSave
        if (!autoSave || autoSave == undefined || parseInt(autoSave) == 0) {
          // save immediately
          let editor = this.$store.state[Namespace.EDITOR].editor
          var _this = this
          // stop ticker
          if (this.codeTicker) {
            this.codeTicker.stop()
            this.codeTicker = null
          }
          editor.getSession().on("change", function (e) {
            if (_this.codeTicker) {
              return
            }
            _this.commitCode()
          })
          return
        }
        // reset the old one
        if (this.codeTicker) {
          this.codeTicker.reset(parseInt(autoSave) * 1000)
          return
        }
        // start a new one
        this.codeTicker = new Ticker(this.commitCode, parseInt(autoSave) * 1000)
      },
      isSelected(file) {
        return file == this.$store.state[Namespace.PROJECT].currentFile
      },
      select(file) {
        this.$store.commit(`${Namespace.PROJECT}/setCurrentFile`, file)
        this.updateEditor(file)
      },
      deSelect(file) {
        let index = this.selects.indexOf(file)
        this.$store.commit(`${Namespace.PROJECT}/deSelectFile`, file)
        if (!this.isSelected(file)) {
          return
        }
        if (index == -1 || index - 1 >= this.selects.length) {
          this.select('')
        } else {
          this.select(this.selects[index - 1])
        }
      },
      toggleFolder() {
        this.showFolder = !this.showFolder
      },
      changeFontSize(isIncre) {
        let editor = this.$store.state[Namespace.EDITOR].editor
        let options = editor.getOptions()
        if (!options || options == undefined || !options.fontSize) {
          return
        }
        let sizeArr = options.fontSize.split('pt')
        if (sizeArr.length != 2) {
          return
        }
        let size = parseInt(sizeArr[0])
        if (isIncre) {
          size++
        } else {
          size--
          if (size < config.setting.minFontSize) {
            size = config.setting.minFontSize
          }
        }
        editor.setOptions({
          fontSize: `${ size }pt`
        })
      },
      onFileRenamed(oldName) {
        this.$prompt(this.$t('NewFile.Alert'), this.$t('NewFile.Prompt'), {
          confirmButtonText: this.$t('NewFile.Confirm'),
          cancelButtonText: this.$t('NewFile.Cancel'),
          inputValue: oldName
        }).then(({
          value
        }) => {
          if (value.length == 0) {
            this.$message(this.$t('AlertMessage.EmptyName'))
            return
          }
          let p = this.$store.state[Namespace.PROJECT].projects[0]
          let name = generateFileName(value, p)
          if (name.length == 0) {
            this.$message(this.$t('AlertMessage.DuplicatedFile'))
            return
          }
          this.$store.commit(Namespace.PROJECT + '/renameFile', {
            old: oldName,
            new: name
          })
          if (this.$store.state[Namespace.PROJECT].currentFile == oldName) {
            this.$store.commit(`${Namespace.PROJECT}/setCurrentFile`, name)
          }
          this.$forceUpdate()
        }).catch(() => {})
      },
      setting() {
        this.showSetting = true
      },
      cancelSetting() {
        this.showSetting = false
      },
      confirmSetting() {
        this.showSetting = false
        let autoSave = this.$store.state[Namespace.SETTING].setting.autoSave || 0
        if (autoSave == 0 && this.codeTicker == null) {
          return
        }
        if (this.codeTicker && this.codeTicker.interval() == parseInt(autoSave) * 1000) {
          return
        }
        // auto save interval has updated
        this.runSaveCodeTimer()
      },
      handleClick() {
        switch (this.activeTab) {
          case "deploy": {
            this.$refs.lockPane.init()
          }
          default: {}
        }
      },
      async compile() {
        if (!this.clicmd || this.clicmd == undefined || this.clicmd.length == 0) {
          this.$message(this.$t('Tool.Noop'))
          return
        }
        const currentFile = this.$store.state[Namespace.PROJECT].currentFile
        const code = this.$store.state[Namespace.PROJECT].codes[currentFile] || ''
        try {
          let url = `compile/${this.clicmd}`
          let body = {
            Code: code
          }
          if (this.clicmd == 'instance' && this.cliargs && this.cliargs != undefined && this.cliargs.length > 0) {
            body['Args'] = this.cliargs.split(",")
          }
          if (this.clicmd == 'instance' && (!body.hasOwnProperty('Args') || body['Args'].length == 0)) {
            this.$message(this.$t('Request.ParamMiss'))
            return
          }
          const ret = await this.$http.post(url, body)
          if (ret.body.status != "success") {
            this.$message({
              message: ret.body.error_detail,
              duration: 5000
            })
            return
          }
          if (Object.keys(ret.body.data).length == 0) {
            return
          }
          this.cliret = ret.body.data[this.clicmd]
        } catch (e) {
          log.error(`request compile err` + e)
          this.$message(this.$t('Request.Error'))
        }
      },
      handleUpload(name, content) {
        let p = this.$store.state[Namespace.PROJECT].projects[0]
        let fileName = generateFileName(name, p)
        if (fileName.length == 0) {
          this.$message(this.$t("AlertMessage.DuplicatedFile"))
          return
        }
        this.$store.commit(Namespace.PROJECT + '/newFile', {
          title: fileName,
          isLeaf: true,
          isSelected: true
        })
        this.$store.commit(`${Namespace.PROJECT}/updateCode`, {
          name: fileName,
          content: content
        })
        this.$store.commit(Namespace.PROJECT + '/setCurrentFile', fileName)
        this.updateEditor(fileName)
      },
      saveas(name) {
        let content = this.$store.state[Namespace.PROJECT].codes[name] || ''
        var FileSaver = require('file-saver')
        var blob = new Blob([content], {
          type: "text/plain;charset=utf-8"
        });
        FileSaver.saveAs(blob, name);
      },
      download() {
        const JSZip = require("jszip")
        var zip = new JSZip()
        var folder = zip.folder("Contract");
        let p = this.$store.state[Namespace.PROJECT].projects[0]
        for (let file of p.children) {
          let fileContent = this.$store.state[Namespace.PROJECT].codes[file.title] || ''
          folder.file(file.title, fileContent);
        }
        zip.generateAsync({
          type: "blob"
        }).then(function (content) {
          var FileSaver = require('file-saver')
          FileSaver.saveAs(content, "Contract.zip");
        })
      },
      submitLockTx(utxoid) {
        this.$refs['unlockPane'].setUtxoid(utxoid)
      },
      closeConsole(closed) {
        this.showConsole = !closed
      }
    }
  }

</script>

<style scoped>
  .home {
    display: flex;
    /* border: 1px solid; */
  }

  .folder-container {
    width: 13%;
    height: calc(100vh - 20px);
    /* border: 1px solid; */
  }

  .folder {
    width: 100%;
    height: calc(100vh - 50px);
  }

  .folder-menu {
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    /* border-bottom: 1px solid rgba(238, 241, 255, 0.9);  */
  }

  .menu-item {
    width: 20px;
    line-height: 30px;
    height: 30px;
    /* background: url("../assets/logo.png") */
  }

  .menu-item>img {
    margin-left: 5%;
    /* margin-top: 16%; */
  }


  .editor-container {
    width: 67%;
    height: calc(100vh - 20px);
    /* height: calc(90vh+30px); */
    padding-right: 10px;
    /* border: 1px solid; */
  }

  .editor-normal {
    width: 100%;
    height: 75vh;
    /* border: 1px solid; */
  }

  .editor-expand {
    width: 100%;
    height: calc(95vh - 60px);
  }

  .console-expand {
    height: 20vh;
    /* border: 1px solid; */
  }

  .console-hide {
    height: 40px;
  }

  .editor-header {
    width: 100%;
    height: 30px;
    display: flex;

  }

  .editor-menu {
    /* width: 3%; */
    width: 50px;
    display: flex;
  }

  .editor-menu-arrow {
    width: 16px;
    height: 100%;
    line-height: 100%;
  }

  .editor-menu-arrow>img {
    margin-top: 5px;
  }

  .editor-menu-font-size {
    margin-left: 12px;
  }

  .editor-menu-font-size>div {
    height: 13px;
  }

  .breadcrumb {
    width: calc(100% - 50px);
    display: flex;
    overflow: hidden;
  }

  .breadcrumb-item {
    display: flex;
    background-color: rgba(238, 241, 255, 0.9);
    margin-right: 10px;
    padding-left: 10px;
    padding-right: 4px;
  }

  .breadcrumb-item>span {
    padding-right: 10px;
    padding-top: 5px;
    display: inline-block;
  }

  .breadcrumb-item-bold {
    font-weight: bold;
  }

  .tools {
    width: 20%;
    height: calc(90vh+30px);

  }

  .lock-pane {
    height: 84vh;
    overflow: scroll;
  }


  .unlock-pane {
    height: 84vh;
    overflow: scroll;
  }

  .tool-tab {
    box-shadow: 0 0 0 0;
    -webkit-box-shadow: 0 0 0 0;
    /* background-color:rgb(35, 35, 31); */
  }

  .tool-pane {
    height: 84vh;
  }

  .tool-args {
    margin-top: 20px;
  }

  .tool-ret {
    margin-top: 20px;
  }

  .tool-args-input {
    margin-top: 20px;
  }

  .tool-ret-text {
    margin-top: 20px;
  }

  img:hover {
    opacity: 0.7;
    cursor: pointer;
  }

  .el-row {
    padding-bottom: 12px;
  }

</style>
