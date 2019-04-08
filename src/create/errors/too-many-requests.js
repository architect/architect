let chalk = require('chalk')

module.exports = function tooManyRequests(err) {
  console.log(chalk.dim('-----'))
  console.log(chalk.bold.red(`Rate limit error`), chalk.bold.white(err.message))
  console.log(chalk.dim('-----'))
  console.log(`We've hit rate limits provisioning your app. This is a common issue with provisioning certain AWS services, and is nothing to worry about. It means we're working faster than your account is currently provisioned to handle. Try re-running ` + chalk.cyan.bold('npx create') + ` in a few moments.`)
  console.log(`If the problem persists, try using a different availability zone, or you can also request rate limit increases on some services by contacting AWS support.`)
  process.exit(1)
}
