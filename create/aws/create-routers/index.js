var aws = require('aws-sdk')
var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')

module.exports = function createRouters(params, callback) {

  assert(params, {
    app: String,
  })

  var gateway = new aws.APIGateway
  var create = (name, callback)=> gateway.createRestApi({name}, callback)
  var skip = (name, callback)=> callback()
  var list = callback=> gateway.getRestApis({}, callback)
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
        callback()
      })
    }
  })
}
