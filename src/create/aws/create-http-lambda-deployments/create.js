let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let print = require('../../_print')
let getLambda = require('../_get-lambda')

module.exports = function create({app, name, stage, arc}, callback) {
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  lambda.getFunction({
    FunctionName: stage
  },
  function _gotFn(err) {
    if (err && err.name === 'ResourceNotFoundException') {
      setTimeout(function delay() {
        print.create('@http', stage)
        createLambda({
          app,
          name,
          stage,
          arc
        }, callback)
      }, 7000)
    }
    else if (err) {
      callback(err)
    }
    else {
      print.skip('@http', stage)
      callback()
    }
  })
}

function createLambda({app, name, stage, arc}, callback) {
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  waterfall([
    function read(callback) {
      getLambda({
        section: 'http',
        codename: name,
        deployname: stage,
        arc
      }, callback)
    },
    function write(arn, callback) {
      lambda.updateFunctionConfiguration({
        FunctionName: stage,
        Environment: {
          Variables: {
            'ARC_APP_NAME': app,
            'NODE_ENV': stage.includes('staging')? 'staging' : 'production',
            'SESSION_TABLE_NAME': 'jwe'
          }
        }
      },
      function updateFunctionConfiguration(err) {
        if (err) console.log(err)
        callback(null, arn)
      })
    }
  ],
  function done(err) {
    if (err) console.log(err)
    else callback()
  })
}
