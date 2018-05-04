var parallel = require('run-parallel')
var aws = require('aws-sdk')
var iam = new aws.IAM
var list = errback=> iam.listRoles({}, errback)
var RoleName = 'arc-role'

/**
 * Lambdas require permissions to access AWS infrastructure.
 * They get those permissions via an IAM Role. (Idenitty Access Management Role)
 *
 * This function returns `arc-role`: the default IAM Role for arc Lambdas.
 */
module.exports = function _getRole(callback) {
  // first look for the role
  list(function _roles(err, results) {
    if (err) throw err
    var found = results.Roles.find(r=> r.RoleName === RoleName)
    if (found) {
      callback(null, found)
    }
    else {
      // if we didn't find it create it
      // and return that
      iam.createRole({
        AssumeRolePolicyDocument: JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
            Sid: "",
            Effect: "Allow",
            Principal: {
              Service: "lambda.amazonaws.com"
            },
            Action: "sts:AssumeRole"
          }]
        }),
        Path: "/",
        RoleName,
      },
      function _createRole(err, result) {
        if (err) throw err
        var policies = [
          'arn:aws:iam::aws:policy/AmazonS3FullAccess',
          'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
          'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
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
              "Version": "2012-10-17",
              "Statement": [{
                "Effect": "Allow",
                "Action": [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                  "logs:DescribeLogStreams"
                ],
                "Resource": "arn:aws:logs:*:*:*"
              }]
            }, null, 2),
            PolicyName: "ArcLambdaCloudwatchPolicy",
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
  })
}
