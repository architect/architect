let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function createWebSocketLambdaCode(params, callback) {
  assert(params, {
    app: String, // app name
    name: String, // route name
    arc: Object, // arc obj
  })
  createCode({
    space: 'ws',
    idx: params.name,
    app: params.app,
    arc: params.arc,
  }, callback)
}
