let chalk = require('chalk')
let aws = require('aws-sdk')
let readArcFile = require('@architect/utils/read-arc')

/**
 * ensures the following env vars are present:
 *
 * - NODE_ENV (default 'testing')
 * - AWS_REGION (default us-west-2)
 */
module.exports = function ensureCreds() {

  let arc
  try {
    let parsed = readArcFile()
    arc = parsed.arc
  }
  catch(e) {
    if (e.message === 'not_found') {
  console.log(chalk.grey('.------------------------------.'))
  console.log(chalk.grey('|'), chalk.bold.yellow('Warning'), chalk.yellow('.arc file not found!'), chalk.grey('|'))
  console.log(chalk.grey('|'), chalk.grey('Generate by running'), chalk.bold.green('arc init'), chalk.grey('|'))
  console.log(chalk.grey('\'------------------------------\''))
    }
  }

  // always ensure NODE_ENV
  if (!process.env.hasOwnProperty('NODE_ENV'))
    process.env.NODE_ENV = 'testing'

  // always ensure AWS_REGION
  if (!process.env.AWS_REGION)
    process.env.AWS_REGION = 'us-west-2'

  if (arc && arc.aws) {
    let region = arc.aws.find(e=> e[0] === 'region')
    let profile = arc.aws.find(e=> e[0] === 'profile')

    if (region)
      process.env.AWS_REGION = region[1]

    if (profile)
      process.env.AWS_PROFILE = profile[1]

    // FORCE use AWS_REGION and AWS_PROFILE
    if (process.env.AWS_PROFILE) {
      aws.config.credentials = new aws.SharedIniFileCredentials({
        profile: process.env.AWS_PROFILE
      })
    }
  }
}
