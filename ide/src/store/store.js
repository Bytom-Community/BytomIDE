import Vue from 'vue'
import vuex from 'vuex'

Vue.use(vuex)

import project from './project'
import editor from './editor'
import setting from './setting'
import {sNamespace} from "../common/const.js"
import VuexPersistence from 'vuex-persist'
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: [sNamespace.PROJECT, sNamespace.SETTING],
})
let modules = {}

modules[sNamespace.PROJECT] = project
modules[sNamespace.EDITOR] = editor
modules[sNamespace.SETTING] = setting


export default new vuex.Store({
  modules: modules,
  plugins: [vuexLocal.plugin],
  
})