export default {
  namespaced: true,
  state: {
    alias: [],
    assets: [],
    assetObj: {},
    isLogin: false
  },
  mutations: {
    setAlias(state, alias) {
      state.alias = alias
    },
    setAssets(state, assets) {
      state.assets = assets
    },
    setAssetObj(state, assetObj) {
      state.assetObj = assetObj
    },
    setIsLogin(state, is) {
      state.isLogin = is
    }
  }
}
