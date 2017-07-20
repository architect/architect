var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var triggers = require('./_get-triggers')
var builder = require('./_trigger-builder')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String, // test-app
    table: Object, // sessions-arc:
  })

  var name = Object.keys(params.table)[0] // table name
  var attr = params.table[name]           // table attributes
  var mthd = triggers(attr)               // table triggers or false

  var fns = mthd.map(method=> {
    return function _createTrigger(callback) {
      builder(params.app, name, method, callback)
    }
  })

  parallel(fns, function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
