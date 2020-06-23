let chalk = require('chalk')
let { readArc } = require('@architect/utils')

/**
 * Ensures the following env vars are present:
 *
 * - NODE_ENV (default 'testing')
 * - AWS_REGION (default us-west-2)
 */
module.exports = function ensureEnv () {
  try {
    readArc()
  }
  catch (e) {
    if (e.message === 'not_found') {
      console.log(chalk.grey('.------------------------------.'))
      console.log(chalk.grey('|'), chalk.bold.yellow('Warning'), chalk.yellow('.arc file not found!'), chalk.grey('|'))
      console.log(chalk.grey('|'), chalk.grey('Generate by running'), chalk.bold.green('arc init'), chalk.grey('|'))
      console.log(chalk.grey('\'------------------------------\''))
    }
  }

  // always ensure NODE_ENV
  if (!process.env.NODE_ENV)
    process.env.NODE_ENV = 'testing'

  // always ensure AWS_REGION
  if (!process.env.AWS_REGION)
    process.env.AWS_REGION = 'us-west-2'
}
