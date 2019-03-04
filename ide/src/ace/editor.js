const setFontSize = (editor, fs) => {
    if (!fs || fs == undefined || fs.indexOf('pt') == -1) {
        return
    }
    editor.setOptions({
        fontSize: fs,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    })
}

const setTheme = (editor, theme) => {
    if (!theme || theme == undefined) {
        return
    }
    require(`ace-builds/src-noconflict/theme-${theme.trim()}.js`)
    editor.setTheme(`ace/theme/${theme.trim()}`)
}

const setKeybinding = (editor, m) => {
    if (!m || m == undefined) {
        return
    }
    if (m == "default") {
        editor.setKeyboardHandler(`ace/keyboard/ace`)
        return
    }
    require(`ace-builds/src-noconflict/keybinding-${m}.js`)
    editor.setKeyboardHandler(`ace/keyboard/${m}`)
}

export {
    setFontSize,
    setTheme,
    setKeybinding
}