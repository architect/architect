let path = require('path')
let series = require('run-series')
let cp = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {

  var {pathToCode} = params

  var src = path.join(process.cwd(), 'src', 'shared')
  var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  var arcFileSrc = path.join(process.cwd(), '.arc')
  var arcFileDest = path.join(dest, '.arc')

  series([
    function copyShared(callback) {
      cp(src, dest, {overwrite:true}, callback)
    },
    function copyArc(callback) {
      cp(arcFileSrc, arcFileDest, {overwrite:true}, callback)
    }
  ],
  function done(err) {
    if (params.tick) {
      params.tick()
    }
    // move along
    if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}

