var assert = require('@smallwins/validate/assert')
var getName = require('../_get-lambda-name')
var createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    route: Array,
    app: String,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = getName(params.route[1])
  var name = `${mthd}${pth}`

  createCode({
    space: 'json',
    idx: name,
    app: params.app
  }, callback)
}
