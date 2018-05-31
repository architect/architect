/* eslint "global-require": "off" */
var join = require('path').join

module.exports = function _getFunction(api, type, verb, path) {
  var p = join(process.cwd(), 'src', type, `${verb}${path}`)
  return require(p).handler
}

