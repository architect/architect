let err = require('./_err')
let aws = require('aws-sdk')

module.exports = function ensureAwsCredentials(arc) {

  // check to see if we're coding aws creds into arc
  let override = false
  if (arc.aws) {
    let region = arc.aws.find(e=> e[0] === 'region')
    let profile = arc.aws.find(e=> e[0] === 'profile')

    if (!region)
      err('@aws missing region in .arc')

    if (!profile)
      err('@aws missing profile in .arc')

    process.env.AWS_REGION = region[1]
    process.env.AWS_PROFILE = profile[1]
    override = true
  }

  // ensure a region
  if (!process.env.AWS_REGION)
    process.env.AWS_REGION = 'us-west-2'

  // always use arc file if defined
  if (override) {
    // FORCE the use of AWS_REGION and AWS_PROFILE which we set in init
    var credentials = new aws.SharedIniFileCredentials({profile: process.env.AWS_PROFILE})
    aws.config.credentials = credentials
  }

  let missingProfile = !process.env.AWS_PROFILE
  let missingSecretAccessKey = !process.env.AWS_SECRET_ACCESS_KEY
  let missingAccessKeyId = !process.env.AWS_ACCESS_KEY_ID
  if (missingProfile && missingSecretAccessKey && missingAccessKeyId) {
    process.env.AWS_PROFILE = 'xxx'
    process.env.AWS_SECRET_ACCESS_KEY = 'xxx'
    process.env.AWS_ACCESS_KEY_ID = 'xxx'
  }
}
