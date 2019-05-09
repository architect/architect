let chalk = require('chalk')

module.exports = function tooManyRequests(err) {
  console.log(chalk.dim('-----'))
  console.log(chalk.bold.red(`Invalid Credentials`), chalk.bold.white(err.message))
  console.log(chalk.dim('-----'))
  console.log(`Unable to continue due to invalid AWS credentials.`)
  process.exit(1)
}
