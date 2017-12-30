var path = require('path')
var fs = require('fs')

/**
 * ensures lambda/package.json and lambda/package-lock.json exist
 */
module.exports = function _validate(params, callback) {

  let pathToCode = params.pathToCode
  let pathToPkg = path.join(pathToCode, 'package.json')
  let pathToLock = path.join(pathToCode, 'package-lock.json')
  let pkgExists = fs.existsSync(pathToPkg) // FIXME perf (lets do this async)
  let lockExists = fs.existsSync(pathToLock)

  if (!pkgExists) {
    callback(Error('cancel_missing_package'))
  }
  else if (!lockExists) {
    callback(Error('cancel_missing_lock'))
  }
  else {
    if (params.tick) params.tick()
    callback()
  }
}
