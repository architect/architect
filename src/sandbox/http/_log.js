var chalk = require('chalk')

module.exports = function log(params) {
  var {verb, route, path} = params
  var httpVerb = chalk.dim(verb === 'get'? ' get' : verb)
  var lambda = chalk.dim(`${verb}${path}`)
  var routePath = chalk.cyan(route) + ' '
  console.log(`${httpVerb} ${routePath.padEnd(45, '.')} ${lambda}`)
}
