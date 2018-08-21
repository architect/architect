let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

module.exports = function map(FunctionName, callback) {
  waterfall([
    function reads(callback) {
      let sts = new aws.STS
      sts.getCallerIdentity({}, callback)
    },
    function writes(result, callback) {
      let REGION = process.env.AWS_REGION
      let ACCOUNT = result.Account
      let EventSourceArn = `arn:aws:sqs:${REGION}:${ACCOUNT}:${FunctionName}`
      let lambda = new aws.Lambda
      lambda.createEventSourceMapping({
        EventSourceArn,
        FunctionName,
        BatchSize: 1,
      }, callback)
    }
  ], callback)
}
