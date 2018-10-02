/* eslint global-require:"off" */
var runPluginFunction = require('../../util/run-plugin-promise')
/**
 * calls any plugins registered in .arc with beforeDeploy
 */
module.exports = function afterDeploy(params, stats, callback) {
  if (params.tick) params.tick()
  runPluginFunction(params, 'afterDeploy')
    .then(() => callback(null, stats))
    .catch(callback)
}
