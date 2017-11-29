/* eslint global-require:"off" */
var runPluginFunction = require('../../util/runPluginFunction')
/**
 * calls any plugins registered in .arc with beforeDeploy
 */
module.exports = function beforeDeploy(params, callback) {
  runPluginFunction(params, 'beforeDeploy')
    .then(() => callback())
    .catch(callback)
}
