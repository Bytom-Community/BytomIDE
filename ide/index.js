'use strict'

const express = require('express')
const path = require('path')
require('express-di')
const app = express()
const bodyParser = require('body-parser')

//解析body
app.use(bodyParser.json())
const API_VERSION = 'v0'

//允许跨域
app.use('/' + API_VERSION,function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers','Content-Type');
  res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
  next()
})


//打印错误
app.use(function (err, req, res, next) {
  console.log('error')
  console.error(err.stack)
  next(err)
})

app.use('/', express.static(path.resolve(__dirname, 'dist/')))

//返回结果处理
app.use(function (req, res, next) {
  if (res._error) {
    res.json({
      result: 'fail',
      data: res._error
    })
    return next()
  }
  if (!res._data) {
    return next()
  }
  res.json({
    result: res._result || 'success',
    data: res._data
  })
})

// 处理错误
app.use(function (err, req, res, next) {
  res.json({
    result: 'error',
    data: {
      code: err.code,
      message: err.message
    }
  })
})

const PORT = 8080
const server = app.listen(PORT, function() {
  console.log('listen ', PORT)
})
