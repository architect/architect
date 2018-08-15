let chalk = require('chalk')

// pretty print errors to the console
module.exports = function _print(err) {
  if (err) {
   console.log(chalk.white('Error!', chalk.red.bold(err.message)))
   console.log(chalk.dim(err.stack), chalk.yellow(err.code))
  }
}
