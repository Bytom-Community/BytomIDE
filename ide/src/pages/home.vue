<template>
    <div class="home">
        <div class="folder-container" v-show="showFolder">
                <div class="folder-menu" >
                        <div class="menu-item" @click="newfile">
                            <img src="../assets/plus.png" width="15px" height="15px" />
                        </div>
                        <div class="menu-item">
                            <img src="../assets/folder.png" width="16px" height="16px" />
                        </div>
                        <div class="menu-item" @click="setting">
                                <img src="../assets/settings.png" width="16px" height="16px" />
                        </div>
                </div>
                <div class="folder">
                        <folder style="height: 100%;" @remove="deSelect" @rename="onFileRenamed"></folder>
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
                                <div @click="changeFontSize(true)"><img src="../assets/raw_plus.png" alt="" style="width: 12px; height: 12px;"></div>
                                <div @click="changeFontSize(false)"><img src="../assets/raw_minus.png" alt="" style="width: 12px; height: 12px;"></div>
                            </div>
                            
                        </div>
                        <div class="breadcrumb"  ref="breadcrumb">
                            <div class="breadcrumb-item"  v-for="name in selects" :class="{ 'breadcrumb-item-bold': isSelected(name) }" >
                                <span @click="select(name)">{{ name }}</span>
                                <div @click="deSelect(name)"><img src="../assets/close.png" alt="" style="width: 12px; height: 12px;"></div>
                            </div>
                        </div>
                </div>
                <editor class="editor"></editor>
        </div>
        <div class="tools">
                <el-tabs v-model="activeTab" type="border-card" @tab-click="handleClick">
                    <el-tab-pane label="CLI" name="cli">
                            <el-label>操作</el-label>
                            <el-select v-model="clicmd" placeholder="命令" style="width:100px;">
                                    <el-option label="bin" value="bin"></el-option>
                                    <el-option label="instance" value="instance"></el-option>
                                    <el-option label="ast" value="ast"></el-option>
                            </el-select>
                            <el-button>执行</el-button>
                           
                            
                    </el-tab-pane>
                    <el-tab-pane label="部署" name="deploy">部署</el-tab-pane>
                    <el-tab-pane label="运行" name="run">运行</el-tab-pane>
                </el-tabs>
        </div>
      
        <setting-dialog @cancel="cancelSetting" @confirm="confirmSetting" :isVisible="showSetting"></setting-dialog>
    </div>
</template>
<script>
import editor from '../components/editor'
import folder from "../components/tree"
import settingDialog from "../components/setting"
import {sNamespace, GLOBAL} from "../common/const.js"
import {generateFileName} from "../utils/generator.js"
import {setFontSize, setTheme, setKeybinding} from "../ace/editor.js"
export default {
    name: 'home',
    components: { editor, folder, settingDialog },
    data () {
        return {
            showFolder: true,
            showSetting: false,
            activeTab: 'cli',
            clicmd: ''
        }
    },
    computed: {
        selects() {
            return this.$store.state[sNamespace.PROJECT].selects
        }
    },
    created() {
        this.createDemoFile()
        this.initEditor()
        this.saveCode()
    },
    methods: {
        createDemoFile() {
            const first = this.$store.state[sNamespace.PROJECT].projects[0]
            if (first.children.length) {
                return
            }
            this.$store.commit(sNamespace.PROJECT + '/newFile', { title: "demo", isLeaf:true, isSelected: true })
        },
        initEditor() {
            let id =  setInterval(()=>{
                if (this.$store.state[sNamespace.EDITOR].editor == null) {
                    return
                }
                clearInterval(id)
                const editor = this.$store.state[sNamespace.EDITOR].editor
                const setting = this.$store.state[sNamespace.SETTING].setting
                console.log('12setting', setting)
                if (setting.fontSize.length == 0) {
                    this.$store.commit(sNamespace.SETTING + '/init', { fontSize: "12pt", mode: 'default', theme: ' textmate' })
                } else {
                    setFontSize(editor, setting.fontSize)
                    setKeybinding(editor, setting.mode)
                    setTheme(editor, setting.theme)
                }

                const currentFile = this.$store.state[sNamespace.PROJECT].currentFile
                if (currentFile.length == 0) {
                    return
                }
                const code = this.$store.state[sNamespace.PROJECT].codes[currentFile]
                const session = editor.getSession()
                session.setValue(code)
               
                // this.$store.state[sNamespace.EDITOR].editor.setKeyboardHandler('ace/keyboard/vim')
                return
            }, 1000)
        },
        newfile() {
            this.$prompt('请输入文件名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            }).then(({ value }) => {
                if (value.length == 0) {
                    this.$message("名字为空")
                    return
                }
                let p = this.$store.state[sNamespace.PROJECT].projects[0]
                let name = generateFileName(value, p)
                if (name.length == 0) {
                    this.$message("名字重复")
                    return
                }
               
                this.$store.commit(sNamespace.PROJECT + '/newFile', { title: name, isLeaf:true, isSelected: true })
                this.$store.commit(`${sNamespace.PROJECT}/setCurrentFile`, name)
                this.updateEditor(name)
            }).catch(() => {})
        },
        updateEditor(file) {
            let code = this.$store.state[sNamespace.PROJECT].codes[file]
            if (!code || code == undefined || !code.length) {
                code = ''
            }
            const session = this.$store.state[sNamespace.EDITOR].editor.getSession()
            session.setValue(code)
        },
        saveCode() {
            let id =  setInterval(()=>{
                let editor = this.$store.state[sNamespace.EDITOR].editor
                if (editor == null) {
                    return
                }
                const currentFile = this.$store.state[sNamespace.PROJECT].currentFile
                if (!currentFile || currentFile == undefined ||currentFile.length == 0) {
                    return
                }
                const session = editor.getSession()
                this.$store.commit(`${sNamespace.PROJECT}/updateCode`, {
                    name: currentFile,
                    content: session.getValue(),
                })
            }, 10000)
        },
        isSelected(file) {
            return  file == this.$store.state[sNamespace.PROJECT].currentFile
        },
        select(file) {
            this.$store.commit(`${sNamespace.PROJECT}/setCurrentFile`, file)
            this.updateEditor(file)
        },
        deSelect(file) {
            let index = this.selects.indexOf(file)
            this.$store.commit(`${sNamespace.PROJECT}/deSelectFile`, file)
            // this.selects = this.$store.state[sNamespace.PROJECT].selects
            if (!this.isSelected(file)) {
               return
            }
            if (index == -1 || index - 1 >= this.selects.length) {
                    this.select('')
            } else {
                this.select(this.selects[index-1])
            }
        },
        toggleFolder() {
            this.showFolder = !this.showFolder
        },
        changeFontSize(isIncre) {
            let editor = this.$store.state[sNamespace.EDITOR].editor
            let options =  editor.getOptions()
            if (!options || options == undefined || !options.fontSize) {
                return
            }
            let sizeArr = options.fontSize.split('pt')
            if (sizeArr.length != 2) {
                return
            }
            let size = parseInt(sizeArr[0])
            if (isIncre) {
                size ++
            } else {
                size --
                if (size < GLOBAL.MIN_FONT_SIZE) {
                    size = GLOBAL.MIN_FONT_SIZE
                }
            }
            editor.setOptions({
                fontSize: `${ size }pt`
            })
        },
        onFileRenamed(oldName) {
            this.$prompt('请输入文件名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: oldName
            }).then(({ value }) => {
                if (value.length == 0) {
                    this.$message("名字为空")
                    return
                }
                let p = this.$store.state[sNamespace.PROJECT].projects[0]
                let name = generateFileName(value, p)
                if (name.length == 0) {
                    this.$message("名字重复")
                    return
                }
                this.$store.commit(sNamespace.PROJECT + '/renameFile', { old: oldName, new: name })
                if (this.$store.state[sNamespace.PROJECT].currentFile == oldName) {
                    this.$store.commit(`${sNamespace.PROJECT}/setCurrentFile`, name)
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
        },
        handleClick() {}
    }
}
</script>
    
<style  scoped>

.home {
    display: flex;
    /* border: 1px solid; */
}

.folder-container {
    width: 13%;
    height: calc(90vh+30px);
    /* border: 1px solid; */
}
.folder {
    width: 100%;
    height: 90vh;
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
.menu-item > img {
    margin-left: 5%;
    /* margin-top: 16%; */
}


.editor-container {
    width: 67%;
    height: calc(90vh+30px);
    padding-right: 10px;
}
.editor {
    width: 100%;
    height: 90vh;
    /* border:1px solid; */
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
.editor-menu-arrow > img {
    margin-top: 5px;
}

.editor-menu-font-size {
    margin-left: 12px;
}
.editor-menu-font-size > div {
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
    margin-right:10px;
    padding-left: 10px;  
    padding-right: 4px; 
}
.breadcrumb-item > span {
    padding-right: 10px;
    padding-top: 5px;
    display:inline-block; 
}
.breadcrumb-item-bold {
    font-weight: bold;
}

.tools {
    width: 20%;
    height: calc(90vh+30px);
    /* border: 1px solid; */
}

img:hover {
    opacity:0.7;
    cursor: pointer;
}

</style>