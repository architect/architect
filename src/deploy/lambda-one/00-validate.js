let path = require('path')
let exists = require('path-exists').sync
let retry = require('../helpers/retry')

/**
 * ensures lambda/package.json and lambda/package-lock.json exist
 */
module.exports = function _validate(params, callback) {

  let {pathToCode, tick} = params
  let pathToPkg = path.join(pathToCode, 'package.json')
  let pathToLock = path.join(pathToCode, 'package-lock.json')
  let pkgExists = exists(pathToPkg)
  let lockExists = exists(pathToLock)

  let found = exists(pathToCode)
  if (!found) {
    if (tick) tick('')
    retry(pathToCode)
    callback(Error(`cancel_not_found: ${pathToCode}`))
  }
  else if (!pkgExists) {
    if (tick) tick('')
    callback(Error('cancel_missing_package'))
  }
  else if (!lockExists) {
    if (tick) tick('')
    callback(Error('cancel_missing_lock'))
  }
  else {
    if (tick) tick('Validating Lambda bundles')
    callback()
  }
}
