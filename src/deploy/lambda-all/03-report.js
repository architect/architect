let series = require('run-series')
let retry = require('../helpers/retry')
let delta = require('../helpers/delta')
let report = require('../helpers/report')

    // report the lambda deployment results
module.exports = function getReporter(params) {
  let {env, arc, start} = params
  return function _reports(results, stats, callback) {
    series([
      function(callback) {
        report({
          results,
          env,
          arc,
          start,
          stats
        }, callback)
      },
      function(callback) {
        // read any failures into an array ['src/http/get-foo', 'src/events/foo-baz']
        let retries = retry().map(f=> f.pathToCode)
        if (retries.length > 0) {
          delta(arc, retries, callback)
        }
        else {
          callback()
        }
      }
    ], callback)
  }
}
