let assert = require('@smallwins/validate/assert')
let getRole = require('../_get-iam-role')

module.exports = function createIAMRole(params, callback) {
  assert(params, {
    app: String,
  })
  getRole(callback)
}
