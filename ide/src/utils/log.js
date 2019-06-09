import {
  Namespace,
  LogLevel
} from "../common/const.js"

class Logger {
  /**
   *Creates an instance of User.
   * @param {*} _store
   * @memberof Log
   */
  constructor(_store) {
    this.store = _store
  }
  info = async (log) => {
    const logObj = {
      level: LogLevel.Info,
      date: new Date(),
      content: log
    }
    this.store.commit(`${Namespace.LOG}/addLog`, logObj)
  }
  error = async (log) => {
    const logObj = {
      level: LogLevel.Error,
      date: new Date(),
      content: log
    }
    this.store.commit(`${Namespace.LOG}/addLog`, logObj)
  }
  clean = async () => {
    this.store.commit(`${Namespace.LOG}/clean`)
  }
}


export {
  Logger
}
