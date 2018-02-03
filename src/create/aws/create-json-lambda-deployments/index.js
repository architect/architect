var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var print = require('../../_print')
var getLambda = require('../_get-lambda')
var getName = require('../_get-lambda-name')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    route: Array,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = getName(params.route[1])
  var name = `${mthd}${pth}`

  function _create(app, stage, callback) {
    setTimeout(function _wait() {
      lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
        if (err && err.name === 'ResourceNotFoundException') {
          print.create('@json', stage)
          _createLambda(app, name, stage, callback)
        }
        else if (err) {
          console.log(err)
          callback(err)
        }
        else {
          print.skip('@json', stage)
          callback()
        }
      })
    }, 2017)
  }

  var staging = _create.bind({}, params.app, `${params.app}-staging-${name}`)
  var production = _create.bind({}, params.app, `${params.app}-production-${name}`)

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

function _createLambda(app, name, env, callback) {
  waterfall([
    function _getLambda(callback) {
      getLambda({
        section: 'json',
        codename: name,
        deployname: env,
      }, callback)
    },
    function _addApiGatewayInvokePermission(topicArn, callback) {
      lambda.addPermission({
        FunctionName: env,
        Action: "lambda:InvokeFunction",
        Principal: "apigateway.amazonaws.com",
        StatementId: "idx-1" + Date.now(),
        SourceArn: topicArn,
      },
      function _addPermission(err) {
        if (err) {
          console.log(err)
        }
        callback(null, topicArn)
      })
    },
    function _addEnvVars(arn, callback) {
      var sessionTableName = `${env.replace(name, '')}arc-sessions`
      var config = {
        FunctionName: env,
        Environment: {
          Variables: {
            'ARC_APP_NAME': app,
            'NODE_ENV': env.includes('staging')? 'staging' : 'production',
          }
        }
      }
      // allow for opting out of session
      if (!process.env.ARC_DISABLE_SESSION) {
        config.Environment.Variables['SESSION_TABLE_NAME'] = sessionTableName
      }
      lambda.updateFunctionConfiguration(config, function _update(err) {
        if (err) {
          console.log(err)
        }
        callback()
      })
    }
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
