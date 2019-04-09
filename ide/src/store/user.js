export default {
  namespaced: true,
  state: {
    alias: [],
    assets: [],
    assetObj: {},
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
  }
}
