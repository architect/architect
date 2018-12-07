let assert = require('@smallwins/validate/assert')
let waterfall = require('run-waterfall')

let _read = require('./00-read')
let _prep = require('./01-prep')
let _deploy = require('./02-deploy')
let _report = require('./03-report')
    /*
       TODO At some point in the future we'll refactor this to read .arc instead of glob
       - when we do, take note that Lambda path encoding changed
         in 4.x when we went from statically bound content type functions to http
       - we added (back) period and dash, and did not reuse chars
       - to maintain backwards compatibility,
         we'll need to aim legacy functions at a diff path builder
       - see: src/util/get[-legacy]-lambda-name.js
     */
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
