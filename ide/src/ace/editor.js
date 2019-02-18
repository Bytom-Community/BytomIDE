const setFontSize = (editor, fs) => {
    editor.setOptions({
        fontSize: fs,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
    })
}

const setTheme = (editor, theme) => {
    require(`ace-builds/src-noconflict/theme-${theme}.js`)
    editor.setTheme(`ace/theme/${theme}`)
}

const setKeybinding = (editor, m) => {
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