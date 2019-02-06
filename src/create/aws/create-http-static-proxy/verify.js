let aws = require('aws-sdk')

module.exports = function verify({endpoint, restApiId}, callback) {
  let region = process.env.AWS_REGION
  let api = new aws.APIGateway({region})
  api.getResources({restApiId}, function done(err, result) {
    if (err) callback(err)
    else {
      // check for proxy+ or a greedy root if it exists bail
      let greedy = i=>/\/static\/{(\w+|proxy\+)}/g.test(i.pathPart)
      let cancel = result.items.find(greedy)
      if (cancel) callback('cancel')
      else callback(null, {endpoint, restApiId})
    }
  })
}
