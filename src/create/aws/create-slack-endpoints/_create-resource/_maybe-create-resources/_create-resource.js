let aws = require('aws-sdk')

module.exports = function createResource(params, callback) {
  setTimeout(function _latency() {
    let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.createResource(params, callback)
  }, 2018)
}
