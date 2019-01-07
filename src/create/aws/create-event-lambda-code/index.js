let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    event: String,
    app: String,
    arc: Object,
  })

  createCode({
    space: 'events',
    idx: params.event,
    app: params.app,
    arc: params.arc,
  }, callback)
}