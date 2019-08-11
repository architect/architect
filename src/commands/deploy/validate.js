let utils = require('@architect/utils')
let chalk = require('chalk')

let pretty = {
  fail(msg) {
    let fail = 'Failed to deploy'
    let messages = {
      missing_aws: 'missing aws in .arc',
      missing_bucket: 'missing @aws bucket in .arc for cloudformation deploy',
      not_found: 'missing .arc file',
    }
    let b = chalk.bgRed.bold.white
    let w = chalk.yellow
    console.log(b(fail), w(messages[msg]))
  }
}

module.exports = function validate(/*opts*/) {
  // check for AWS_REGION and AWS_PROFILE
  // check for .aws/credentials
  // check for sam-cli
  // check for aws-cli
  try {
    let {arc} = utils.readArc()

    if (!arc.aws)
      throw Error('missing_aws')

    let hasBucket = arc.aws && arc.aws.some(tuple=> tuple[0] === 'bucket')
    if (!hasBucket)
      throw Error('missing_bucket')
  }
  catch(e) {
    pretty.fail(e.message)
    process.exit(1)
  }
}
