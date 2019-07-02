let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function createWebSocketLambdaCode(params, callback) {
  assert(params, {
    app: String, // app name
    name: String, // route name
    arc: Object, // arc obj
  })

  let defaultRoutes = ['ws-$connect', 'ws-$disconnect', 'ws-$default']
  let name = params.name

  if (defaultRoutes.includes(name)) {
    name = name.replace('$','')
  }

  createCode({
    space: 'ws',
    idx: name,
    app: params.app,
    arc: params.arc,
  }, callback)
}
