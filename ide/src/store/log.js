export default {
  namespaced: true,
  state: {
    logs: []
  },
  mutations: {
    addLog(state, text) {
      state.logs.push(text)
    },
    clean(state) {
      state.logs = []
    },
  }
}
