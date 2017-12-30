var chalk = require('chalk')
var path = require('path')

/**
 * reports any errors otherwise silently continue
 */
module.exports = function _done(params, err, stats) {
  if (params.tick) params.tick()
  let {pathToCode, callback, lambda} = params
  let pathToPkg = path.join(pathToCode, 'package.json')
  let pathToLock = path.join(pathToCode, 'package-lock.json')
  if (err && err.message === 'cancel_missing_package') {
    console.log(chalk.yellow.dim('\nskip ' + pathToPkg + ' not found'))
  }
  else if (err && err.message === 'cancel_missing_lock') {
    console.log(chalk.yellow.dim('\nskip ' + pathToLock + ' not found'))
  }
  else if (err) {
    console.log(`\n${chalk.dim('deploy')} ${chalk.red.bold(lambda)} ${chalk.dim('failed')}`)
    console.log(err)
    return callback(err)
  }
  callback(null, stats)
}
