/* eslint global-require:"off" */
var path = require('path')

/**
 * gets the lambda name for the given source function
 *
 * convention:
 * appname-env-lambdaname
 */
module.exports = function getFunctionName(params) {

  let {arc, env, pathToCode} = params
  let app = arc.app[0]
  let pathToPkg = path.join(pathToCode, 'package.json')
  let name = require(path.resolve(pathToPkg)).name
  let lambda = name.replace(app, '')

  return `${app}-${env}${lambda}`
}
