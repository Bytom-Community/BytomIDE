// vuex store namespace
const Namespace = {
  PROJECT: "project",
  EDITOR: "editor",
  SETTING: 'setting',
  USER: 'user',
  LOG: "log",
}

// common 
const Common = {
  InitEditorTimeout: 10,
  BTM_ACCOUNT_SCRIPT_LENGTH: 44
}


// input params type
const ParamInputType = {
  GeneratePublicKey: 0,
  InputPublicKey: 1,
  GenerateProgram: 2,
  InputProgram: 3,
  SelectAsset: 4,
  InputAsset: 5,

}

const ParamType = {
  PublicKey: "PublicKey",
  Program: "Program",
  Amount: "Amount",
  Asset: "Asset",
  Boolean: "Boolean",
  Integer: "Integer",
  Hash: "Hash",
  String: "String"
}

const LogLevel = {
  Debug: 1,
  Info: 2,
  Warn: 3,
  Error: 4
}

export {
  Namespace,
  Common,
  ParamInputType,
  ParamType,
  LogLevel
}
