var parallel = require('run-parallel')
var aws = require('aws-sdk')

function _create({RoleName}, callback) {
  let iam = new aws.IAM
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
  }, callback)
}

module.exports = function _createRole(params, callback) {

  let RoleName = params.name
  let policies = params.policies
  var iam = new aws.IAM

  _create({RoleName}, function done(err, result) {
    if (err) {
      callback(err)
    }
    else {
      let all = policies.map(PolicyArn=> {
        return function _attachPolicy(callback) {
          iam.attachRolePolicy({
            RoleName,
            PolicyArn,
          }, callback)
        }
      })

      all.push(function _putPolicy(callback) {
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

      parallel(all, function _done(err) {
        if (err) {
          callback(err)
        }
        else {
          setTimeout(function _fakeLatency() {
            callback(null, result.Role)
          }, 9999)
        }
      })
    }
  })
}
