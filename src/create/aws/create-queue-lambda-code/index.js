let assert = require('@smallwins/validate/assert')
let createCode = require('../_create-code')


module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    queue: typeof params.queue === 'object' ? Object : String,
    app: String,
    arc: Object,
  })

  createCode({
    space: 'queues',
    idx: typeof params.queue === 'object' ? Object.keys(params)[0] : params.queue,
    app: params.app,
    arc: params.arc,
  }, callback)
}
