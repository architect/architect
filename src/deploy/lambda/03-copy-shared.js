var fs = require('fs')
var path = require('path')
var cpr = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {
  var {pathToCode} = params
  var src = path.join(process.cwd(), 'src', 'shared')
  var exists = fs.existsSync(src) // FIXME perf
  if (exists) {
    var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    function noop(err) {
      if (err) console.log(err)
      if (params.tick) params.tick()
      callback()
    }
    cpr(src, dest, {deleteFirst: true}, function _done(err) {
      if (err) noop(err)
      else {
        var arcFileSrc = path.join(process.cwd(), '.arc')
        var arcFileDest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared', '.arc')
        cpr(arcFileSrc, arcFileDest, {deleteFirst: true}, noop)
      }
    })
  }
  else {
    if (params.tick) params.tick()
    callback() // quietly continue if ./src/shared doesn't exist
  }
}
