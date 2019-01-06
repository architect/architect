let parallel = require('run-parallel')
let hydrate = require('../../hydrate')
let prep = require('../lambda-one/prep')
let _progress = require('../../util/progress')
let series = require('run-series')

module.exports = function _prepare(params) {
  let {env, arc} = params
  return function _prep(results, callback) {

    let pathToCode = results
    // - 3 ticks for each Function prep (validate, before-deploy, run-plugin-promise)
    // - 8 ticks for hydrate.install()
    let total = results.length*3+(8)
    let progress = _progress({
      name: `Preparing ${results.length} Function${results.length > 1? 's':''}:`,
      total
    })
    let tick = progress.tick
    let hydrateDeps = false

    let failedprep = []
    series([
      function _goPrep(callback) {
        parallel(results.map(pathToCode=> {
          return function _prep(callback) {
            prep({
              env,
              arc,
              pathToCode,
              tick,
              hydrateDeps,
            },
            function _prepped(err) {
              // Failure during validation
              if (err && err.message === 'cancel_not_found') {
                failedprep.push(pathToCode)
                // Two ticks remain at this point
                tick('')
                tick('')
                callback()
              }
              else if (err) {
                callback(err)
              }
              else {
                callback()
              }
            })
          }
        }), callback)
      },
      function _hydrate(callback) {
        hydrate.install({arc, pathToCode, tick}, callback)
      },
    ],
    function done(err) {
      if (err) {
        callback(err)
      }
      else {
        let filtered = results.filter(pathToCode=> !failedprep.includes(pathToCode))
        callback(null, filtered)
      }
    })
  }
}
