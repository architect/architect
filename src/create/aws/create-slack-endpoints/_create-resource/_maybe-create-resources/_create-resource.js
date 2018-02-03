var aws = require('aws-sdk')
var gateway = new aws.APIGateway

module.exports = function createResource(params, callback) {
  setTimeout(function _latency() {
    gateway.createResource(params, callback)
  }, 2018)
}
