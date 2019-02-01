let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

/**
 * adds the invoke permission
 */
module.exports = function iam({restApiId, arn}, callback) {
  let region = process.env.AWS_REGION
  let sts = new aws.STS({region})
  let lambda = new aws.Lambda({region})
  waterfall([
    function getAccount(callback) {
      sts.getCallerIdentity({}, function _getIdx(err, result) {
        if (err) callback(err)
        else {
          callback(null, result.Account)
        }
      })
    },
    function addPermission(account, callback) {
      lambda.addPermission({
        FunctionName: arn,
        Action: 'lambda:InvokeFunction',
        Principal: "apigateway.amazonaws.com",
        StatementId: "arc-idx-" + Date.now(),
        SourceArn: `arn:aws:execute-api:${region}:${account}:${restApiId}/*/*`,
      }, callback)
    },
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
