/* eslint global-require:"off" */
var runPluginFunction = require('../../util/run-plugin-promise')
/**
 * calls any plugins registered in .arc with beforeDeploy
 */
module.exports = function beforeDeploy(params, callback) {
  if (params.tick) params.tick('Calling pre-deploy plugins...')
  runPluginFunction(params, 'beforeDeploy')
    .then(() => callback())
    .catch(callback)
}
