var aws = require('aws-sdk')
var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')

function create(name, callback) {
  var gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  gateway.createRestApi({
    name,
    minimumCompressionSize: 0
  }, callback)
}

function list(callback) {
  var gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  gateway.getRestApis({
    limit: 500,
  }, callback)
}

module.exports = function createRouters(params, callback) {

  assert(params, {
    app: String,
  })

  var skip = (name, callback)=> callback()
  var staging = `${params.app}-staging`
  var production = `${params.app}-production`

  list(function _list(err, result) {
    if (err) {
      throw err
    }
    else {

      var hasStaging = result.items.find(i=> i.name === staging)
      var hasProduction = result.items.find(i=> i.name === production)
      var stage = hasStaging? skip.bind({}, staging) : create.bind({}, staging)
      var prod = hasProduction? skip.bind({}, production) : create.bind({}, production)

      parallel([
        stage,
        prod
      ],
      function _create(err) {
        if (err) {
          console.log(err)
          callback(err)
        }
        else {
          callback()
        }
      })
    }
  })
}
