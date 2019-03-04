const addField = (obj1, obj2) => {
    for (let key in obj2) {
        let value = obj2[key]
        if (!obj1.hasOwnProperty(key)) {
            obj1[key] = value
            continue
        }
        if (typeof(value) != 'object' || Array.isArray(value)) {
            continue
        }
        addField(obj1[key], value)
    }
}

const config = () => {
    let config = require("../config/config.json")
    const defaultCfg = {
        "api": "http://47.92.243.141:8080/v1",
        "setting": {
            "minFontSize": 10,
            "defaultFontSize": 12,
            "defaultMode": "default",
            "defaultTheme": "textmate",
            "defaultLang": "zh",
            "defaultAutoSaveInterval": 0
        },
        "folder": {
            "maxUploadNum": 10
        }
    }
    if (!config || config == undefined) {
      return defaultCfg
    }
    addField(config, defaultCfg)
    return config
}

export {
    config
}