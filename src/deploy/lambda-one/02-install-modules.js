let npm = require('../../util/npm')

/**
 * installs modules using package-lock.json
 */
module.exports = function _modules(params, callback) {
  let {pathToCode, tick} = params
  if (tick)
    tick('Installing modules...')

  npm(pathToCode, ['ci', '--ignore-scripts'], callback)
}
