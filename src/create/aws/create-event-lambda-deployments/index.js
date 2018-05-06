let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let assert = require('@smallwins/validate/assert')
let zip = require('zipit')
let aws = require('aws-sdk')
let lambda = new aws.Lambda
let sns = new aws.SNS
let getIAM = require('../_get-iam-role')
let print = require('../../_print')
let getTopicArn = require('./_get-sns-topic-arn')

/**
 * creates sns lambdas
 *
 * - app-name-staging-event-name
 * - app-name-production-event-name
 */

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    event: String,
  })

  function _create(app, stage, callback) {
    lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
      if (err && err.name === 'ResourceNotFoundException') {
        print.create('@events', stage)
        _createLambda(app, params.event, stage, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        // noop if it exists
        //console.log(`skip: ${stage} exists`)
        print.skip('@events', stage)
        callback()
      }
    })
  }

  var staging = _create.bind({}, params.app, `${params.app}-staging-${params.event}`)
  var production = _create.bind({}, params.app, `${params.app}-production-${params.event}`)

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

function _createLambda(app, event, env, callback) {
  waterfall([
    // gets the IAM role for lambda execution
    function _getRole(callback) {
      getIAM(callback)
    },
    function _readCode(role, callback) {
      zip({
        input: [
          `src/events/${event}/index.js`,
          `src/events/${event}/package.json`,
          `src/events/${event}/node_modules`
        ],
        cwd: process.cwd()
      },
      function _zip(err, buffer) {
        if (err) {
          callback(err)
          console.log(err)
        }
        else {
          callback(null, buffer, role)
        }
      })
    },
    function _createFunc(zip, role, callback) {
      lambda.createFunction({
        Code: {
          ZipFile: zip
        },
        Description: `@event ${event}`,
        FunctionName: env,
        Handler: "index.handler",
        MemorySize: 1152,
        Publish: true,
        Role: role.Arn,
        Runtime: 'nodejs8.10',
        Timeout: 5,
        Environment: {
          Variables: {
            'NODE_ENV': env.includes('staging')? 'staging' : 'production',
            'ARC_APP_NAME': app,
          }
        }
      },
      function _createFn(err, result) {
        if (err && err.name != 'ResourceConflictException') {
          console.log(err)
          callback(err)
        }
        else if (err && err.name == 'ResourceConflictException') {
          lambda.getFunction({FunctionName:env}, function _gotFn(err, data) {
            if (err) {
              callback(err)
            }
            else {
              callback(null, data.Configuration.FunctionArn)
            }
          })
        }
        else {
          callback(null, result.FunctionArn)
        }
      })
    },
    function _subscribeLambda(lambdaArn, callback) {
      // the sns topic name === lambda name
      getTopicArn(env, function _getName(err, topicArn) {
        if (err) {
          callback(err)
        }
        else {
          sns.subscribe({
            Protocol: 'lambda',
            TopicArn: topicArn,
            Endpoint: lambdaArn,
          },
          function _subscribe(err) {
            if (err) {
              console.log(err)
            }
            callback(null, topicArn)
          })
        }
      })
    },
    function _addSnsPermission(topicArn, callback) {
      lambda.addPermission({
        FunctionName: env,
        Action: "lambda:InvokeFunction",
        Principal: "sns.amazonaws.com",
        StatementId: "idx-1" + Date.now(),
        SourceArn: topicArn,
      },
      function _addPermission(err) {
        if (err) {
          console.log(err)
        }
        callback()
      })
    }],
    function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
