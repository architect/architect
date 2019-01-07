let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    queue: String,
    app: String,
    arc: Object,
  })

  createCode({
    space: 'queues',
    idx: params.queue,
    app: params.app,
    arc: params.arc,
  }, callback)
}
