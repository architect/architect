var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var getLambda = require('../_get-lambda')
var print = require('../../_print')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    scheduled: Array,
  })

  var app = params.app
  var name = params.scheduled[0]
  var rule = params.scheduled.join(' ').replace(name, '').trim()
  var staging = _create.bind({}, `${app}-staging-${name}`, name, rule)
  var production = _create.bind({}, `${app}-production-${name}`, name, rule)

  parallel([
    staging,
    production,
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}

function _create(deployname, codename, rule, callback) {
  var lambda = new aws.Lambda({region: process.env.AWS_REGION})
  //var cloudwatch = new aws.CloudWatchEvents({region: process.env.AWS_REGION})
  lambda.getFunction({FunctionName:deployname}, function _gotFn(err) {
    if (err && err.name === 'ResourceNotFoundException') {
      print.create('@scheduled', deployname)
      _createLambda(deployname, codename, rule, callback)
    }
    else if (err) {
      console.log(err)
      callback(err)
    }
    else {
      // noop if it exists
      print.skip('@scheduled', deployname)
      callback()
    }
  })
}

// TODO: possibly factor into own module and test separately
function _createLambda(deployname, codename, rule, callback) {
  var lambda = new aws.Lambda({region: process.env.AWS_REGION})
  var cloudwatch = new aws.CloudWatchEvents({region: process.env.AWS_REGION})
  var lambdaArn
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
        StatementId: "idx-1" + Date.now(),
        SourceArn: arn.RuleArn,
      }, callback)
    },
    function _putTargets(permission, callback) {
      cloudwatch.putTargets({
        Rule: deployname,
        Targets: [{
          Id: ''+Date.now(),
          Arn: lambdaArn,
        }]
      }, callback)
    }
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
