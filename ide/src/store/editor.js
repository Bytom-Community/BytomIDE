export default {
    namespaced: true,
    state: {
      editor: null,
    },
    mutations: {
      setEditor(state,  e) {
        state.editor = e
      },
    }
  }