var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var print = require('../../_print')
var getLambda = require('../_get-lambda')

// app (app name)
// name (function local code name. eg. ws-disconnect
// lambda (deployment name. eg. testws-production-ws-default)
// env (staging or production)
module.exports = function create(params, callback) {
  // console.log('calling create-ws-lambda-deployments with' ,params)
  let {name} = params
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  lambda.getFunction({
    FunctionName: params.lambda
  },
  function done(err) {
    if (err && err.name === 'ResourceNotFoundException') {
      print.create('@ws', name)
      createLambda(params, callback)
    }
    else if (err) {
      callback(err)
    }
    else {
      print.skip('@ws', name)
      callback()
    }
  })
}

function createLambda(params, callback) {
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  waterfall([
    function _getLambda(callback) {
      getLambda({
        section: 'ws',
        codename: params.name,
        deployname: params.lambda,
        arc: params.arc,
      }, callback)
    },
    function _addEnvVars(arn, callback) {
      lambda.updateFunctionConfiguration({
        FunctionName: params.lambda,
        Environment: {
          Variables: {
            'ARC_APP_NAME': params.app,
            'NODE_ENV': params.env,
            'SESSION_TABLE_NAME': 'jwe',
          }
        }
      }, callback)
    }
  ], callback)
}
