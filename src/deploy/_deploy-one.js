var assert = require('@smallwins/validate/assert')
var deploy = require('./lambda')
var s3 = require('./static')
var _report = require('./_report')

module.exports = function deployOne(params) {
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
    start: Number,
  })
  // is one of: static, .static, static/ or .static/
  var isStatic = /\.?static\/?/.test(params.pathToCode)
  if (isStatic) {
    // copy .static to s3
    s3(params, x=> !x)
  }
  else {
    deploy(params, function _done(err, stats) {
      if (err) {
        console.log(err)
      }
      else {
        _report({
          results:[params.pathToCode],
          env:params.env,
          arc:params.arc,
          start:params.start,
          stats:[stats]
        }, x=> !x)
      }
    })
  }
}
