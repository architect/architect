var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var getLambda = require('../_get-lambda')
var print = require('../../_print')

module.exports = function createScheduledLambda(deployname, codename, rule, callback) {

  var lambda = new aws.Lambda({region: process.env.AWS_REGION})
  var cloudwatch = new aws.CloudWatchEvents({region: process.env.AWS_REGION})
  var lambdaArn

  print.create('@scheduled', deployname)

  waterfall([
    function _getLambda(callback) {
      getLambda({
        section: 'scheduled',
        codename,
        deployname,
      }, callback)
    },
    function _addCloudWatchEvent(arn, callback) {
      lambdaArn = arn
      cloudwatch.putRule({
        Name: deployname,
        ScheduleExpression: rule,
        State: 'ENABLED'
      }, callback)
    },
    function _addPermission(arn, callback) {
      lambda.addPermission({
        FunctionName: deployname,
        Action: "lambda:InvokeFunction",
        Principal: "events.amazonaws.com",
        StatementId: deployname,
        SourceArn: arn.RuleArn,
      },
      function done(err) {
        if (err && err.code === 'ResourceConflictException') {
          callback() // only add it once
        }
        else if (err) {
          callback(err)
        }
        else {
          callback()
        }
      })
    },
    function _putTargets(callback) {
      cloudwatch.putTargets({
        Rule: deployname,
        Targets: [{
          Id: deployname,
          Arn: lambdaArn,
        }]
      }, callback)
    }
  ],
  function done(err) {
    if (err)
      console.log(err)
    callback()
  })
}
