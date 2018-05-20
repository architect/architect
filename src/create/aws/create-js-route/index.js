var assert = require('@smallwins/validate/assert')
var create = require('../_create-route')

module.exports = function _createHtmlRoute(params, callback) {
  assert(params, {
    app: String,
    route: String,
  })
  create({
    app: params.app,
    route: ['get', params.route],
    type: 'js',
  }, callback)
}
