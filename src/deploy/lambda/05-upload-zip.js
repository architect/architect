var series = require('run-waterfall')
var path = require('path')
var zipit = require('zipit')
var glob = require('glob')
var aws = require('aws-sdk')

/**
 * zips and uploads the function to aws
 */
module.exports = function uploadZip(params, callback) {
  let {pathToCode, lambda} = params
  series([
    // get a handle on the files to zip
    function _read(callback) {
      glob(path.join(process.cwd(), pathToCode, '/*'), callback)
    },
    function _zip(files, callback) {
      zipit({ // FIXME need to investigate faster zip options
        input: files,
      }, callback)
    },
    // upload the function
    function _upload(buffer, callback) {
      (new aws.Lambda).updateFunctionCode({
        FunctionName: lambda,
        ZipFile: buffer
      },
      function _updatedFun(err) {
        if (err) {
          callback(err)
        }
        else {
          if (params.tick) params.tick()
          var lambdaBytes = Buffer.byteLength(buffer, 'utf8')
          var oneMegInBytes = 1000000
          var lambdaMegs = (lambdaBytes/oneMegInBytes).toFixed(2)
          var stats = {name: params.pathToCode, size: `${lambdaMegs} mb`}
          callback(null, stats)
        }
      })
    }
  ], callback)
}
