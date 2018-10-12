let series = require('run-series')
let reads = require('./_reads')
let sync = require('./_sync-role')

module.exports = function _apply(arc) {
  reads(arc, function done(err, result) {
    if (err) console.log(err)
    else {
      // walk each result
      series(result.map(thing=> {
        return function syncRole(callback) {
          sync(thing, callback)
        }
      }))
    }
  })
}
