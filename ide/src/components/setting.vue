<template>
    <el-dialog :title="$t('Setting.Title')"  :visible.sync="isVisible" @close="close" :show-close=false>
            <el-form :model="setting" >
                <el-form-item :label="$t('Setting.FontSize')" label-width="120px">
                <el-select v-model="setting.fontSize" :placeholder="$t('Setting.ChooseFontSize')" @change="setFontSize">
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
                <el-form-item :label="$t('Setting.SetMode')" label-width="120px">
                        <el-radio-group v-model="setting.mode" @change="setMode">
                                <el-radio-button label="default"></el-radio-button>
                                <el-radio-button label="vim"></el-radio-button>
                                <el-radio-button label="emacs"></el-radio-button>
                        </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('Setting.Theme')" label-width="120px">
                        <el-select v-model="setting.theme" :placeholder="$t('Setting.ChooseTheme')" @change="setTheme">
                                <el-option label="textmate" value="textmate"></el-option>
                                <el-option label="monokai" value="monokai"></el-option>
                                <el-option label="dracula" value="dracula"></el-option>
                                <el-option label="github" value="github"></el-option>
                                <el-option label="tomorrow" value="tomorrow"></el-option>
                                <el-option label="xcode" value="xcode"></el-option>
                                <el-option label="eclipse" value="eclipse"></el-option>
                        </el-select>
                </el-form-item>
                <el-form-item :label="$t('Setting.AutoSave')" label-width="120px">
                    <el-select v-model="setting.autoSave" :placeholder="$t('Setting.ChooseAutoSave')" @change="setAutoSave">
                            <el-option label="0s" value="0"></el-option>
                            <el-option label="5s" value="5"></el-option>
                            <el-option label="10s" value="10"></el-option>
                            <el-option label="20s" value="20"></el-option>
                            <el-option label="30s" value="30"></el-option>
                            <el-option label="60s" value="60"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="$t('Setting.Lang')" label-width="120px">
                    <el-select v-model="setting.lang" :placeholder="$t('Setting.ChooseLang')" @change="setLang">
                            <el-option label="English" value="en"></el-option>
                            <el-option label="简体中文" value="zh"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="confirm">{{ $t('Setting.SaveBtn')}}</el-button>
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
        console.log("lang", this.form)
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
        },
        setLang(l) {
            window.$vueI18n.locale = l
        },
        setAutoSave(t) {}
    }
}
</script>