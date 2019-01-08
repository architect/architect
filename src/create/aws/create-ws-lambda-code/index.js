let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function createWebSocketLambdaCode(params, callback) {
  assert(params, {
    app: String, // app name
    name: String, // route name
  })
  createCode({
    space: 'ws',
    idx: params.name,
    app: params.app,
  }, callback)
}
