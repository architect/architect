let copyShared = require('./_copy-shared')
let envVars = require('./_env-vars')
let inventory = require('../../inventory')
let readArc = require('../../util/read-arc')
let series = require('run-series')

module.exports = function env(callback) {
  let arc
  let pathToCode
  series([
    // Shared copier and env need Arc inventory
    function _readArc(callback) {
      let parsed = readArc()
      arc = parsed.arc
      inventory(arc, null, function _arc(err, result) {
        if (err) callback(err)
        else {
          pathToCode = result.localPaths
          callback()
        }
      })
    },
    function _copyShared(callback) {
      copyShared({arc, pathToCode}, callback)
    },
    function _envVars(callback) {
      envVars(arc, callback)
    }
  ], callback)
}
