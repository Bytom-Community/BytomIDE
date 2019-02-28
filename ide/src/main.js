import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
import store from './store/store'
import './assets/css/sl-vue-tree-dark.css'
require("./assets/js/sl-vue-tree.js")

import VueI18n from 'vue-i18n'
import LangEN from './locale/en'
import LangZH from './locale/zh'

import VueResource from 'vue-resource'

Vue.use(VueI18n)
Vue.use(VueResource)
Vue.http.options.root = 'http://localhost:3000/v1'

import {sNamespace} from './common/const.js'
console.log(' store.state[sNamespace.SETTING].setting.',  store.state[sNamespace.SETTING].setting)

const i18n = new VueI18n({
  locale: store.state[sNamespace.SETTING].setting.lang || 'zh', 
  messages: {
    'en': LangEN,
    'zh': LangZH,
  }
})

window.$vueI18n = i18n

Vue.config.productionTip = false
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})

require('./ace/ace.js')
