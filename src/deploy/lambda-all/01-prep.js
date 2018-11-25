let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let prep = require('../lambda-one/prep')
let _progress = require('../helpers/progress')

module.exports = function _prepare(params) {
  let {env, arc} = params
  return function _prep(results, callback) {

    let total = results.length * 5 // 4 prep steps + 1 tick for bar instantiation
    let progress = _progress({
      name: `Prepare ${results.length} Lambda${results.length > 1? 's':''}`,
      total
    })
    let tick = progress.tick

    let failedprep = []
    waterfall([
      function _goPrep(callback) {
        parallel(results.map(pathToCode=> {
          return function _prep(callback) {
            prep({
              env,
              arc,
              pathToCode,
              tick,
            },
            function _prepped(err) {
              if (err && err.message === 'cancel_not_found') {
                failedprep.push(pathToCode)
                tick('')
                tick('')
                tick('')
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
      }
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
