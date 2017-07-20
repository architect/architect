var parallel = require('run-parallel')
var assert = require('@smallwins/validate/assert')
var readEnv = require('./_read-env')
var readConfigs = require('./_read-configs')
var write = require('./_write')

module.exports = function env(params, callback) {
  assert(params, {
    exec: Boolean
  })
  parallel([
    readEnv,
    readConfigs
  ],
  function _done(err, result) {
    if (err) throw err
    var config = Object.assign({}, result[0], result[1])
    if (params.exec) {
      write(config, callback)
    }
    else {
      callback(null, config)
    }
  })
}
