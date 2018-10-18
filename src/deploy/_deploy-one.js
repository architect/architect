var assert = require('@smallwins/validate/assert')
var prep = require('./lambda')
var deploy = require('./lambda/deploy')
var s3 = require('./public')
var _report = require('./_report')
var waterfall = require('run-waterfall')

module.exports = function deployOne(params) {

  // module contract
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
    start: Number,
  })

  const _prep = prep.bind({}, params)
  const _deploy = deploy.bind({}, params)

  // is one of: public, .public, public/ or .public/
  var isPublic = /\.?public\/?/.test(params.pathToCode)
  if (isPublic) {
    // copy public to s3
    s3(params, x=> !x)
  }
  else {
    waterfall([
      _prep,
      _deploy,
    ],
    function _done(err, stats) {
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
