var assert = require('@smallwins/validate/assert')
var deploy = require('./lambda')
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
  var isStatic = params.pathToCode.test(/\.?static\/?/)
  if (isStatic) {
    // copy .static to s3
    console.log('deploying .static')
  }
  else {
    deploy(params, function _done(err, stats) {
      if (err) {
        console.log(err)
      }
      else {
        _report({
          results:[pathToCode], 
          env, 
          arc, 
          start, 
          stats:[stats]
        })
      }
    })
  }
}
