var fs = require('fs')
var path = require('path')
var parse = require('@architect/parser')

module.exports = function _readEnv(callback) {

  var pathToEnv = path.join(process.cwd(), '.arc-env')
  var pathToArc = path.join(process.cwd(), '.arc')

  if (!fs.existsSync(pathToEnv)) {
    throw Error('missing .arc-env')
  }

  if (!fs.existsSync(pathToArc)) {
    throw Error('missing .arc')
  }

  var arcEnv = fs.readFileSync(pathToEnv).toString()
  var arcRaw = fs.readFileSync(pathToArc).toString()
  var globals = parse(arcEnv)
  var arc = parse(arcRaw)
  callback(null, {globals, arc})
}

