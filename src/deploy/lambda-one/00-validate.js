let path = require('path')
let exists = require('path-exists').sync
let retry = require('../helpers/retry')

/**
 * ensures lambda/package.json and lambda/package-lock.json exist
 */
module.exports = function _validate(params, callback) {

  let pathToCode = params.pathToCode
  let pathToPkg = path.join(pathToCode, 'package.json')
  let pathToLock = path.join(pathToCode, 'package-lock.json')
  let pkgExists = exists(pathToPkg)
  let lockExists = exists(pathToLock)

  let found = exists(pathToCode)
  if (!found) {
    params.tick.cancel()
    retry(params)
    callback(Error('cancel_not_found'))
  }
  else if (!pkgExists) {
    callback(Error('cancel_missing_package'))
  }
  else if (!lockExists) {
    callback(Error('cancel_missing_lock'))
  }
  else {
    if (params.tick) params.tick('Validating Lambda bundles')
    callback()
  }
}
