let series = require('run-waterfall')
let aws = require('aws-sdk')
let zip = require('./_zip-impl')
let retry = require('../helpers/retry')

/**
 * zips and uploads the function to aws
 */
module.exports = function uploadZip(params, callback) {
  let {
    pathToCode,
    lambda,
  } = params
  if (params.tick) params.tick('Updating Lambdas...')
  series([
    // get a handle on the files to zip
    function _zip(callback) {
      zip(pathToCode, callback)
    },
    // upload the function
    function _upload(buffer, callback) {
      let l = new aws.Lambda({region: process.env.AWS_REGION})
      l.updateFunctionCode({
        FunctionName: lambda,
        ZipFile: buffer
      },
      function _updatedFun(err) {
        if (err && err.code === 'ResourceNotFoundException') {
          retry(params)
          let stats = {name: params.pathToCode, size: `Creating`}
          callback(null, stats)
        }
        else if (err) {
          callback(err)
        }
        else {
          let lambdaBytes = Buffer.byteLength(buffer, 'utf8')
          let oneMegInBytes = 1000000
          let lambdaMegs = (lambdaBytes/oneMegInBytes).toFixed(2)
          let stats = {name: params.pathToCode, size: `${lambdaMegs} mb`}
          callback(null, stats)
        }
      })
    }
  ], callback)
}
