let aws = require('aws-sdk')

module.exports = function deploy(params, callback) {
  var gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  gateway.createDeployment(params, function createDeployment(err) {
    if (err) callback(err)
    else {
      setTimeout(function delay() {
        callback()
      }, 5 * 1000)
    }
  })
}
