let aws = require('aws-sdk')
let parallel = require('run-parallel')

module.exports = function reads({app, env}, callback) {

  let region = process.env.AWS_REGION
  let api = new aws.APIGateway({region})
  let lambda = new aws.Lambda({region})

  parallel({
    // read the restApiId
    restApiId(callback) {
      api.getRestApis({
        limit: 500
      },
      function getRestApis(err, apis) {
        if (err) callback(err)
        else {
          let byName = i=> i.name === `${app}-${env}`
          let api = apis.items.find(byName)
          callback(null, api.id)
        }
      })
    },
    // read the lambda arn
    arn(callback) {
      lambda.getFunction({
        FunctionName: `${app}-${env}-get-index`
      },
      function getFunction(err, result) {
        if (err) callback(err)
        else {
          callback(null, result.Configuration.FunctionArn)
        }
      })
    }
  }, callback)
}
