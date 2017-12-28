/* eslint global-require:"off" */
var runPluginFunction = require('../util/runPluginFunction')
/**
 * calls any plugins registered in .arc with afterCreate
 */
module.exports = function afterCreate(params, callback) {
  runPluginFunction(params, 'afterCreate')
    .then(() => callback())
    .catch(callback)
}
