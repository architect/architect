let fs = require('fs')
let path = require('path')
let exists = require('path-exists').sync

/**
 * ensures lambda/package.json and lambda/package-lock.json exist
 */
module.exports = function _validate(params, callback) {

  let pathToCode = params.pathToCode
  let pathToPkg = path.join(pathToCode, 'package.json')
  let pathToLock = path.join(pathToCode, 'package-lock.json')
  let pkgExists = exists(pathToPkg)
  let lockExists = exists(pathToLock)

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
