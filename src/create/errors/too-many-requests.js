let chalk = require('chalk')

module.exports = function tooManyRequests(err) {
  console.log(chalk.dim('-----'))
  console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
  console.log(chalk.dim('-----'))
  console.log(`Congratulations: you have been throttled! This is a very common error with AWS and nothing to worry about. This means you are working faster than your account is currently provisioned to handle. Try re-running ` + chalk.cyan.bold('npx create') + ' after a few minutes. If the problem persists you can request limit increases by contacting AWS support.')
  process.exit(1)
}
