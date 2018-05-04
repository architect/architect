/* eslint-disable */
var glob = require('glob')
var parse = require('@architect/parser')
var fs = require('fs')
var parallel = require('run-parallel')
var exec = require('child_process').exec
var noop = x=>!x

module.exports = function _exec(callback) {
  parallel([
    'src/html/*/.arc-config',
    'src/json/*/.arc-config',
    'src/events/*/.arc-config',
    'src/scheduled/*/.arc-config',
    'src/tables/*/.arc-config',
    'src/indexes/*/.arc-config',
  ].map(p=> {
    return function _g(callback) {
      glob(p, function _glob(err, result) {
        if (err) {
          callback(err)
        }
        else if (result && result.length > 0) {
          var returns = {}
          returns[result] = parse(fs.readFileSync(result[0]).toString())
          callback(null, returns)
        }
        else {
          callback()
        }
      })
    }
  }),
  function _done(err, result) {
    if (err) throw err
    callback(null, {configs:result.filter(Boolean)})
  })
}
