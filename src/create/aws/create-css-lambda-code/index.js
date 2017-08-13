var assert = require('@smallwins/validate/assert')
var _createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {
  assert(params, {
    filename: String,
    app: String,
  })
  _createCode({
    space: 'css',
    idx: params.filename,
    app: params.app,
  }, callback)
}
