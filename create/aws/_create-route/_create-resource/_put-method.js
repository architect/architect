var aws = require('aws-sdk')
var gateway = new aws.APIGateway

module.exports = function putMethod(params, callback) {
  setTimeout(function _latency() {
    gateway.putMethod(params, callback)
  }, 1111)
}

