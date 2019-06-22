let join = require('path').join

/* eslint global-require: "off" */
module.exports = function getFunctionName(appname, env, file) {
  var pkg = file.replace('.arc-config', 'package.json')
  var name = require(join(process.cwd(), pkg)).name
  return name.replace(appname, `${appname}-${env}`)
}
