/* eslint "global-require": "off" */
let path = require('path')

module.exports = function _getFunction(api, type, verb, arcpath) {
  var p = path.join(process.cwd(), 'src', type, `${verb}${arcpath}`)
  return require(p).handler
}

