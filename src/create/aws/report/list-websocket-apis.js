let aws = require('aws-sdk')

module.exports = function list(callback) {

  // a new year, a new api
  let gateway = new aws.ApiGatewayV2({region: process.env.AWS_REGION})

  // closure to store results
  let results = []

  // get apis
  !function page(params={}) {
    // CURRENTLY this new API ONLY returns WEBSOCKET apis
    // apparently this will change… =/ but whatever
    // we are only looking for WEBSOCKET apis
    gateway.getApis(params, function paged(err, result) {
      if (err) callback(err)
      else if (result.NextToken) {
        results = results.concat(result.Items)
        page({NextToken: result.NextToken})
      }
      else {
        results = results.concat(result.Items)
        callback(null, results)
      }
    })
  }()
}

