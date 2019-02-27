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
      setSetting(state,  kv) {
        state.setting[kv.key] = kv.value
      },
      init(state,  s) {
        state.setting = s
      },
    }
  }