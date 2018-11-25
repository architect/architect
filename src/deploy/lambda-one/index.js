var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var prep = require('./prep')
var deploy = require('./deploy')
var _report = require('../helpers/report')
let retry = require('../helpers/retry')
let create = require('../../create')
let path = require('path')
let fs = require('fs')

module.exports = function deployOne(params, callback) {

  // module contract
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
    start: Number,
  })

  //FIXME add support for arc.yaml and arc.json
  let arcPath = path.join(process.cwd(), '.arc')
  let raw = fs.readFileSync(arcPath).toString()
  let arc = params.arc

  const _prep = prep.bind({}, params)
  const _deploy = deploy.bind({}, params)

  waterfall([
    _prep,
    _deploy,
  ],
  function _done(err, stats) {
    let retries = retry()
    if (err && err.message === 'cancel_not_found') {
      create(arc, raw, callback)
    }
    else if (err) {
      callback(err)
    }
    else if (retries.length > 0) {
      create(arc, raw, callback)
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
