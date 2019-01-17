var parallel = require('run-parallel')
var aws = require('aws-sdk')
var RoleName = 'arc-role'

/**
 * Lambdas require permissions to access AWS infrastructure.
 * They get those permissions via an IAM Role. (Identity Access Management Role)
 *
 * This function returns `arc-role`: the default IAM Role for arc Lambdas.
 * If the role does not exist this function will attempt to create it.
 */
module.exports = function _getRole(callback) {
  var iam = new aws.IAM
  iam.getRole({
    RoleName,
  },
  function _roles(err, result) {
    if (err && err.code === 'NoSuchEntity') {
      _createRole(callback)
    }
    else if (err) {
      callback(err)
    }
    else {
      // check for sqs permisson and add it?
      callback(null, result.Role)
    }
  })
}

/**
 * create arc-role
 */
function _createRole(callback) {
  var iam = new aws.IAM
  iam.createRole({
    AssumeRolePolicyDocument: JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Sid: '',
        Effect: 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com'
        },
        Action: 'sts:AssumeRole'
      }]
    }),
    Path: '/',
    RoleName,
  },
  function done(err, result) {
    if (err) throw err

    var policies = [
      'arn:aws:iam::aws:policy/AmazonS3FullAccess',
      'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
      'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
      'arn:aws:iam::aws:policy/AmazonSQSFullAccess',
      'arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole',
      'arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess',
    ].map(PolicyArn=> {
      return function _attachPolicy(callback) {
        iam.attachRolePolicy({
          RoleName,
          PolicyArn,
        }, callback)
      }
    })

    policies.push(function _putPolicy(callback) {
      iam.putRolePolicy({
        PolicyDocument: JSON.stringify({
          'Version': '2012-10-17',
          'Statement': [{
            'Effect': 'Allow',
            'Action': [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
              'logs:DescribeLogStreams'
            ],
            'Resource': 'arn:aws:logs:*:*:*'
          }]
        }, null, 2),
        PolicyName: 'ArcLambdaCloudwatchPolicy',
        RoleName
      }, callback)
    })

    parallel(policies, function _done(err) {
      if (err) throw err
      // the latency magic numbers is a weirder part of cloud
      setTimeout(function _fakeLatency() {
        callback(null, result.Role)
      }, 9999)
    })
  })
}
