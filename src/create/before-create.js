/* eslint global-require:"off" */
var runPluginFunction = require('../util/runPluginFunction')
/**
 * calls any plugins registered in .arc with beforeCreate
 */
module.exports = function beforeCreate(params, callback) {
  runPluginFunction(params, 'beforeCreate')
    .then(() => callback())
    .catch(callback)
}
