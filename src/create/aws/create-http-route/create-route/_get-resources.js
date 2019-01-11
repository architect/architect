let aws = require('aws-sdk')

module.exports = function getResources(params, callback) {
  setTimeout(function _latency() {
    params = params || {}
    params.limit = 500
    let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.getResources(params, callback)
  }, 5000)
}
