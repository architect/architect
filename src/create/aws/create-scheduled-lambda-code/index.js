var assert = require('@smallwins/validate/assert')
var _createCode = require('../_create-code')

/**
 * creates
 *
 * src/scheduled/schedname/index.js
 * src/scheduled/schedname/package.json
 *
 * and installs supporting node_modules
 *
 */
module.exports = function _createLambdaCode(params, callback) {
  assert(params, {
    scheduled: Array,
    app: String,
  })
  _createCode({
    space: 'scheduled',
    idx: params.scheduled[0],
    app: params.app
  }, callback)
}
