let chalk = require('chalk')

module.exports = function err(msg) {
  console.log(chalk.bgBlack.red.bold('Error'), chalk.bgBlack.white.bold(msg))
  process.exit(1)
}
