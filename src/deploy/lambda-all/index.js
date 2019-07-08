let assert = require('@smallwins/validate/assert')
let waterfall = require('run-waterfall')

let _read = require('./00-read')
let _prep = require('./01-prep')
let _deploy = require('./02-deploy')
let _report = require('./03-report')

module.exports = function deployAll(params, callback) {

  assert(params, {
    env: String,
    arc: Object,
    start: Number,
    filters: Array,
  })

  let read = _read(params)
  let prep = _prep(params)
  let deploy = _deploy(params)
  let report = _report(params)

  waterfall([
    read,
    prep,
    deploy,
    report,
  ], callback)
}
