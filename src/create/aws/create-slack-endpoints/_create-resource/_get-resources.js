var aws = require('aws-sdk')
var gateway = new aws.APIGateway

module.exports = function getResources(params, callback) {
  setTimeout(function _latency() {
    params = params || {}
    params.limit = 500
    gateway.getResources(params, callback)
  }, 2016)
}
