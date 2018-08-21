let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    queue: String,
    app: String,
  })

  createCode({
    space: 'queues',
    idx: params.queue,
    app: params.app,
  }, callback)
}
