import Vue from 'vue'
import vuex from 'vuex'

Vue.use(vuex)

import project from './project'
import editor from './editor'
import setting from './setting'
import user from './user'
import {
  Namespace
} from "../common/const.js"
import VuexPersistence from 'vuex-persist'
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: [Namespace.PROJECT, Namespace.SETTING, Namespace.USER],
})
let modules = {}

modules[Namespace.PROJECT] = project
modules[Namespace.EDITOR] = editor
modules[Namespace.SETTING] = setting
modules[Namespace.USER] = user

export default new vuex.Store({
  modules: modules,
  plugins: [vuexLocal.plugin],

})
