export default {
  namespaced: true,
  state: {
    projects: [{ title: 'Contract', isExpanded: true, children: [] }],
    codes: {},
    currentFile: '',
    selects: [],
  },
  mutations: {
    newFile(state, fileName) {
      let first = state.projects[0]
      for (let i = 0; i < first.children.length; i++) {
        first.children[i].isSelected = false
      }
      state.projects[0].children.push(fileName)
      state.currentFile = fileName
    },
    removeFile(state, name) {
      let first = state.projects[0]
      for (let i = 0; i < first.children.length; i++) {
        let n = first.children[i]
        if (n.title != name) {
          continue
        }
        first.children.splice(i, 1)
        delete(state.codes, name)
      }
    },
    updateCode(state, info) {
      state.codes[info.name] = info.content
    },
    setCurrentFile(state, fileName) {
      state.currentFile = fileName
      for (let file of state.projects[0].children) {
        file.isSelected = (file.title == fileName)
      }
      if (!state.selects || state.selects == undefined) {
        state.selects = []
      }
      if (state.selects.indexOf(fileName) != -1 || !fileName || fileName.length == 0) {
        return
      }
      state.selects.push(fileName)
    },
    deSelectFile(state, fileName) {
      if (state.selects.length == 1 && state.selects[0] == fileName) {
        state.selects = []
        return
      }
      for (let i = 0 ; i < state.selects.length; i++) {
        if (state.selects[i] != fileName) {
          continue
        }
        state.selects.splice(i, 1)
        break
      }
    },
    renameFile(state, info) {
      let first = state.projects[0]
      for (let i = 0; i < first.children.length; i++) {
        let ch = first.children[i]
        if (ch.title == info.old) {
          ch.title = info.new
          break
        }
      }
      let selects = state.selects
      let index = selects.indexOf(info.old)
      if (index == -1) {
        return
      }
      selects[index] = info.new
    },

  }
}