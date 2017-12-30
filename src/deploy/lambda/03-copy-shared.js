var fs = require('fs')
var path = require('path')
var mkdir = require('mkdirp').sync
var cpr = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {
  var {pathToCode} = params
  function noop(err) {
    if (err) console.log(err)
    if (params.tick) params.tick()
    callback()
  }
  function copyArc() {
    var destDir = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    var arcFileSrc = path.join(process.cwd(), '.arc')
    var arcFileDest = path.join(destDir, '.arc')
    mkdir(destDir)
    cpr(arcFileSrc, arcFileDest, {deleteFirst: true}, noop)
  }
  var src = path.join(process.cwd(), 'src', 'shared')
  var exists = fs.existsSync(src) // FIXME perf
  if (exists) {
    var dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
    cpr(src, dest, {deleteFirst: true}, function _done(err) {
      if (err) noop(err)
      else copyArc()
    })
  }
  else {
    copyArc() // quietly continue if ./src/shared doesn't exist
  }
}
