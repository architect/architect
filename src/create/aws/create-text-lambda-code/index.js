var assert = require('@smallwins/validate/assert')
var getName = require('../_get-lambda-name')
var createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    route: String,
    app: String,
  })

  createCode({
    space: 'text',
    idx: getName(params.route).replace('-', 'get-'),
    app: params.app
  }, callback)
}
