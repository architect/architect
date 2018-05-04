var assert = require('@smallwins/validate/assert')
var getRole = require('../_get-iam-role')

module.exports = function createJsonRoute(params, callback) {

  assert(params, {
    app: String,
  })

  getRole(function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
