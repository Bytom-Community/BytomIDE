export default {
    namespaced: true,
    state: {
      setting: {
          fontSize: '',
          mode: '',
          theme: '',
          lang: '',
          autoSave: 0,
      },
    },
    mutations: {
      setValue(state,  kv) {
        state.setting[kv.key] = kv.value
      },
      update(state,  s) {
        state.setting = s
      },
      init(state) {
        const config = require("../utils/config.js").config()
        state.setting =  { 
          fontSize:  config.setting.defaultFontSize + 'pt', 
          mode:  config.setting.defaultMode, 
          theme: config.setting.defaultTheme,
          lang:  config.setting.defaultLang, 
          autoSave: config.setting.defaultAutoSaveInterval
        }
      },
    }
  }