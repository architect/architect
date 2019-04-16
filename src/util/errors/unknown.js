let chalk = require('chalk')

module.exports = function unknown(err) {
  console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
  console.log(chalk.dim(err.stack))
  process.exit(1)
}
