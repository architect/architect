var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var prep = require('./prep')
var deploy = require('./deploy')
var _report = require('../helpers/report')

module.exports = function deployOne(params, callback) {

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
      }, callback)
    }
  })
}
