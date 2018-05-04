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
    lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
      if (err && err.name === 'ResourceNotFoundException') {
        print.create('@html', stage)
        _createLambda(app, name, stage, params.route, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        // noop if it exists
        //console.log(`skip: ${stage} exists`)
        print.skip('@html', stage)
        callback()
      }
    })
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

function _createLambda(app, name, env, route, callback) {
  waterfall([
    function _getLambda(callback) {
      getLambda({
        section: 'html',
        codename: name,
        deployname: env,
      }, callback)
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
        callback(null, arn)
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
