let aws = require('aws-sdk')

module.exports = function list(callback) {
  setTimeout(function delay() {
    let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.getRestApis({
      limit: 500,
    }, callback)
  }, 5 * 1000)
}
