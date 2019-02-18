var ace = require("ace-builds/src-noconflict/ace.js")
ace.config.set('modePath', 'ace-builds/src-noconflict')
ace.config.set('basePath', 'ace-builds/src-noconflict')
var editor = ace.edit('javascript-editor')
editor.setShowPrintMargin(false)
editor.getSession().setUseWorker(false)
require("ace-builds/src-noconflict/ext-language_tools.js")
import {setFontSize} from "./editor.js"
setFontSize(editor, '12pt')

require("./mode-equity")
editor.getSession().setMode('ace/mode/equity')
// require('ace-builds/src-noconflict/mode-javascript')
// editor.getSession().setMode('ace/mode/javascript')

import store from '../store/store'
store.commit("editor/setEditor", editor)

