import {
  Namespace,
} from "../common/const.js"
import {
  Ticker
} from "../utils/util.js"
import {
  BytomAPI
} from "./byone.js"
class User {
  /**
   *Creates an instance of User.
   * @param {*} _store
   * @memberof User
   */
  constructor(_store) {
    this.store = _store
  }

  /**
   *checkUserLoginState
   *
   * @memberof User
   */
  checkUsr = () => {
    let _this = this
    let _window = window
    let bytomeAPI = new BytomAPI()
    let ticker = new Ticker(async () => {
      console.log('_window.bytom', _window.bytom)
      if (typeof (_window.bytom) === 'undefined') {
        _this.store.commit(`${Namespace.USER}/setIsLogin`, false)
        return
      }
      try {
        let acc = await bytomeAPI.currentAccount()
        if (!acc || acc == undefined) {
          return
        }
        _this.store.commit(`${Namespace.USER}/setIsLogin`, true)
        let alias = await bytomeAPI.listAccountAlias()
        _this.store.commit(`${Namespace.USER}/setAlias`, alias)
        let assets = await bytomeAPI.listAssets(acc.guid)
        _this.store.commit(`${Namespace.USER}/setAssets`, assets)
      } catch (err) {
        return
      }
      ticker.stop()
    }, 1000)
  }
}

export {
  User
}
