var chalk = require('chalk')

/**
 * print a route as its being registered
 */
module.exports = function log(params) {
  var {verb, route, path} = params
  var httpVerb = chalk.dim(verb === 'get'? ' get' : verb)
  var lambda = chalk.dim(`${verb}${path}`)
  var routePath = chalk.cyan(route) + ' '
  console.log(chalk.grey(`${httpVerb} ${routePath.padEnd(45, '.')} ${lambda}`))
}
