var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var print = require('../../_print')
var getLambda = require('../_get-lambda')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    route: Array,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = params.route[1] === '/'? '-index' : params.route[1].replace(/\//g, '-').replace(/:/g, '000')
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
      lambda.updateFunctionConfiguration({
        FunctionName: env,
        Environment: {
          Variables: {
            'SESSION_TABLE_NAME': sessionTableName,
            'ARC_APP_NAME': app,
            'NODE_ENV': env.includes('staging')? 'staging' : 'production',
          }
        }
      },
      function _update(err) {
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
