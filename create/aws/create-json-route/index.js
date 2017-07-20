var assert = require('@smallwins/validate/assert')
var create = require('../_create-route')

module.exports = function _createJsonRoute(params, callback) {
  assert(params, {
    app: String,
    route: Array,
  })
  create({
    app: params.app,
    route: params.route,
    type: 'json',
  }, callback)
}
