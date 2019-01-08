var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var print = require('../../_print')
var getLambda = require('../_get-lambda')

// app
// name
// lambda
// env 
module.exports = function create(params, callback) {
  let {name} = params
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  lambda.getFunction({
    FunctionName: name
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
      }, callback)
    },
    function _addEnvVars(arn, callback) {
      var config = {
        FunctionName: params.lambda,
        Environment: {
          Variables: {
            'ARC_APP_NAME': params.app,
            'NODE_ENV': params.env,
          }
        }
      }
      // allow for opting out of session
      if (!process.env.ARC_DISABLE_SESSION)
        config.Environment.Variables['SESSION_TABLE_NAME'] = `jwe`
      lambda.updateFunctionConfiguration(config, function update(err) {
        if (err)
          console.log(err)
        callback()
      })
    }
  ], callback)
}
