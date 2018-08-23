var aws = require('aws-sdk')

module.exports = function putMethod(params, callback) {
  setTimeout(function _latency() {
    var gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.putMethod(params, callback)
  }, 1111)
}

