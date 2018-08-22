/* eslint global-require:"off" */
var runPluginFunction = require('../../util/run-plugin-promise')
/**
 * calls any plugins registered in .arc with beforeDeploy
 */
module.exports = function beforeDeploy(params, callback) {
  runPluginFunction(params, 'beforeDeploy')
    .then(() => callback())
    .catch(callback)
}
