let parallel = require('run-parallel')
let hydrate = require('../../hydrate')
let prep = require('../lambda-one/prep')
let beforeDeployPlugins = require('../lambda-one/01-before-deploy')
let _progress = require('../../util/progress')
let series = require('run-series')

module.exports = function _prepare(params) {
  let {env, arc} = params
  return function _prep(results, callback) {
    // - 3 ticks for each Function prep (validate, before-deploy, run-plugin-promise)
    // - 8 ticks for hydrate.install()
    let total = results.length*3+8
    let progress = _progress({
      name: `Preparing ${results.length} Function${results.length > 1? 's':''}:`,
      total
    })
    let tick = progress.tick
    let hydrateDeps = false
    let prepPlugins = false

    let passedprep = []
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
              prepPlugins,
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
                passedprep.push(pathToCode)
                callback()
              }
            })
          }
        }), callback)
      },
      function _hydrate(callback) {
        // Only hydrate everything if no Functions failed prep, otherwise create actions will cancel early
        if (failedprep.length === 0) {
          hydrate.install({
            arc,
            pathToCode: passedprep,
            tick
          }, callback)
        }
        else {
          // Skip hydration
          // Two ticks remain at this point
          Array(8).fill().map(()=> tick(''))
          callback()
        }
      },
      function _beforeDeploy(callback) {
        parallel(passedprep.map(pathToCode => {
          return function _beforeDeploy(callback) {
            beforeDeployPlugins({
              env,
              pathToCode,
              arc,
              tick,
            },
            function _beforeDeploy(err) {
              // Failure during plugins
              if (err) {
                callback(err)
              }
              else {
                callback()
              }
            })
          }
        }), callback)
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
