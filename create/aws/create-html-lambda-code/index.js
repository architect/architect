var assert = require('@smallwins/validate/assert')
var _createCode = require('../_create-code')

module.exports = function _createLambdaCode(params, callback) {

  assert(params, {
    route: Array,
    app: String,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = params.route[1] === '/'? '-index' : params.route[1].replace(/\//g, '-').replace(/:/g, '000')
  var name = `${mthd}${pth}`

  _createCode({
    space: 'html',
    idx: name,
    app: params.app
  }, callback)
}
