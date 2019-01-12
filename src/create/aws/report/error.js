let chalk = require('chalk')

module.exports = function error(err) {
  console.log(chalk.bold.red(err.name), chalk.bold.white(err.message))
  console.log(chalk.grey(err.stack))
}
