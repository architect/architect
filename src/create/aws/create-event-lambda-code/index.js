let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    event: String,
    app: String,
  })

  createCode({
    space: 'events',
    idx: params.event,
    app: params.app
  }, callback)
}