export default {
    namespaced: true,
    state: {
      setting: {
          fontSize: '',
          mode: '',
          theme: '',
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