<template>
        <el-dialog :title="$t('Setting.Title')"  :visible.sync="isVisible" @close="close" :show-close=false @open="dialogOpen">
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
                                <el-option :label="$t('Lang.EN')" value="en"></el-option>
                                <el-option :label="$t('Lang.ZH')" value="zh"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="cancel">{{ $t('Setting.CancelBtn') }}</el-button>
                    <el-button type="primary" @click="confirm">{{ $t('Setting.SaveBtn') }}</el-button>
                </div>
        </el-dialog>
    </template>
    <script>
    import {Namespace} from "../common/const.js"
    import {setFontSize, setTheme, setKeybinding} from "../ace/editor.js"
    export default {
        name: 'editor',
        props: ['isVisible'],
        data() {
            return {
                setting: {},
            }
        },
        computed: {
            // setting: {
            //     get() {
            //         return this.$store.state[Namespace.SETTING].setting
            //     },
            //     set(v) {
            //         console.log('set ', v)
            //     }
            // }
        },
        mounted() {
          this.setOrigin()
        },
        methods: {
            dialogOpen() {
                this.setOrigin()
            },
            setOrigin() {
                let str = JSON.stringify(this.$store.state[Namespace.SETTING].setting)
                this.setting = JSON.parse(str)
                this.setting.autoSave = this.setting.autoSave.toString()
            },
            cancel() {
                let keyMethods = {
                    theme: this.setTheme,
                    fontSize: this.setFontSize,
                    mode: this.setMode,
                    lang: this.setLang,
                    autoSave: this.setAutoSave,
                }
                for (let key in this.$store.state[Namespace.SETTING].setting) {
                    if (this.$store.state[Namespace.SETTING].setting[key] == this.setting[key]) {
                        continue
                    }
                    keyMethods[key](this.$store.state[Namespace.SETTING].setting[key])
                }
                this.$emit('cancel')
                keyMethods = null
    
            },
            confirm() {
                this.$store.commit(`${Namespace.SETTING}/update`, this.setting)
                this.setOrigin()
                this.$emit('confirm', this.setting)
            },
            close() {
                this.$emit('cancel')
            },
            setTheme(t) {
                const editor = this.$store.state[Namespace.EDITOR].editor
                setTheme(editor, t)
                this.setting.theme = t
            },
            setFontSize(s) {
                const editor = this.$store.state[Namespace.EDITOR].editor
                setFontSize(editor, s)
                this.setting.fontSize = s
            },
            setMode(m) {
                const editor = this.$store.state[Namespace.EDITOR].editor
                setKeybinding(editor, m)
                this.setting.mode = m
            },
            setLang(l) {
                window.$vueI18n.locale = l
                this.setting.lang = l
            },
            setAutoSave(t) {}
        }
    }
    </script>