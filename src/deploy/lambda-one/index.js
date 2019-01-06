var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')

var prep = require('./prep')
var deploy = require('./deploy')

var report = require('../helpers/report')
let retry = require('../helpers/retry')
let delta = require('../helpers/delta')

module.exports = function deployOne(params, callback) {

  // module contract
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
    start: Number,
  })

  let arc = params.arc
  params.hydrateDeps = true

  const _prep = prep.bind({}, params)
  const _deploy = deploy.bind({}, params)

  waterfall([
    _prep,
    _deploy,
  ],
  function _done(err, stats) {
    let retries = retry()
    if (err && err.message != 'cancel_not_found') {
      callback(err)
    }
    else if (retries.length > 0) {
      delta(arc, callback)
    }
    else {
      report({
        results:[params.pathToCode],
        env:params.env,
        arc:params.arc,
        start:params.start,
        stats:[stats]
      }, callback)
    }
  })
}
