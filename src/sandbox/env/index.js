let inventory = require('../../inventory')
let copyShared = require('./_copy-shared')
let envVars = require('./_env-vars')
let series = require('run-series')

module.exports = function env(callback) {
  let arc
  series([
    // Shared copier and env need Arc inventory
    function _inventory(callback) {
      inventory(null, null, function _arc(err, result) {
        if (err) callback(err)
        else {
          arc = result
          callback()
        }
      })
    },
    function _copyShared(callback) {
      copyShared(arc, callback)
    },
    function _envVars(callback) {
      envVars(arc, callback)
    }
  ], callback)
}
