let aws = require('aws-sdk')

module.exports = function list(callback) {
  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  gateway.getRestApis({
    limit: 500,
  },
  function done(err, result) {
    if (err) callback(err)
    else callback(null, result.items)
  })
}
