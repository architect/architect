var assert = require('@smallwins/validate/assert')
var createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    scheduled: Array,
    app: String,
    arc: Object,
  })

  createCode({
    space: 'scheduled',
    idx: params.scheduled[0],
    app: params.app,
    arc: params.arc,
  }, callback)
}
