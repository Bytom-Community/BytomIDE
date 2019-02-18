<template>
    <el-dialog title="设置"  :visible.sync="isVisible" @close="close" :show-close=false>
            <el-form :model="setting" >
                <el-form-item label="字体大小" label-width="120px">
                <el-select v-model="setting.fontSize" placeholder="请选择大小" @change="setFontSize">
                    <el-option label="10pt" value="10pt"></el-option>
                    <el-option label="11pt" value="11pt"></el-option>
                    <el-option label="12pt" value="12pt"></el-option>
                    <el-option label="13pt" value="13pt"></el-option>
                    <el-option label="14pt" value="14pt"></el-option>
                    <el-option label="15pt" value="15pt"></el-option>
                    <el-option label="16pt" value="16pt"></el-option>
                    <el-option label="17pt" value="17pt"></el-option>
                    <el-option label="18pt" value="18pt"></el-option>
                </el-select>
                </el-form-item>
                <el-form-item label="编辑模式" label-width="120px">
                        <el-radio-group v-model="setting.mode" @change="setMode">
                                <el-radio-button label="default"></el-radio-button>
                                <el-radio-button label="vim"></el-radio-button>
                                <el-radio-button label="emacs"></el-radio-button>
                        </el-radio-group>
                </el-form-item>
                <el-form-item label="主题" label-width="120px">
                        <el-select v-model="setting.theme" placeholder="请选择主题" @change="setTheme">
                                <el-option label="textmate" value="textmate"></el-option>
                                <el-option label="monokai" value="monokai"></el-option>
                                <el-option label="dracula" value="dracula"></el-option>
                                <el-option label="github" value="github"></el-option>
                                <el-option label="tomorrow" value="tomorrow"></el-option>
                                <el-option label="xcode" value="xcode"></el-option>
                                <el-option label="eclipse" value="eclipse"></el-option>
                        </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <!-- <el-button @click="cancel">取 消</el-button> -->
                <!-- <el-button type="primary" @click="confirm">确 定</el-button> -->
                <el-button type="primary" @click="confirm">保 存</el-button>
            </div>
    </el-dialog>
</template>
<script>
import {sNamespace} from "../common/const.js"
import {setFontSize, setTheme, setKeybinding} from "../ace/editor.js"
export default {
    name: 'editor',
    props: ['isVisible'],
    data() {
        return {
            form: {},
        }
    },
    computed: {
        setting: {
            get() {
                return this.$store.state[sNamespace.SETTING].setting
            },
            set(v) {
                console.log('set ', v)
            }
        }
    },
    mounted() {
        console.log('setting', this.setting)
    },
    methods: {
        cancel() {
            this.$emit('cancel')
        },
        confirm() {
            this.$emit('confirm', this.form)
        },
        close() {
            this.$emit('cancel')
        },
        setTheme(t) {
            const editor = this.$store.state[sNamespace.EDITOR].editor
            setTheme(editor, t)
        },
        setFontSize(s) {
            const editor = this.$store.state[sNamespace.EDITOR].editor
            setFontSize(editor, s)
        },
        setMode(m) {
            const editor = this.$store.state[sNamespace.EDITOR].editor
            setKeybinding(editor, m)
        }
    }
}
</script>