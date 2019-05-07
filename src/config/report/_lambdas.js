let aws = require('aws-sdk')
let series = require('run-series')

// get the general lambda config
module.exports = function lambdas({staging, production}, callback) {
  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})
  series([staging, production].map(FunctionName=> {
    return function getConfig(callback) {
      lambda.getFunctionConfiguration({
        FunctionName
      }, callback)
    }
  }), callback)
}
