let aws = require('aws-sdk')
let assert = require('@smallwins/validate/assert')
let series = require('run-series')
let timeout = 5 * 1000
let firstRun = true

function create(name, callback) {
  if (firstRun) firstRun = false
  else timeout = 30 * 1000
  setTimeout(function delay() {
    let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
    gateway.createRestApi({
      name,
      minimumCompressionSize: 0,
      binaryMediaTypes: [
        '*/*',
      ],
    }, callback)
  }, timeout)
}

module.exports = function createRouters(params, callback) {

  assert(params, {
    app: String,
  })

  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  let skip = (name, callback)=> callback()
  let staging = `${params.app}-staging`
  let production = `${params.app}-production`

  gateway.getRestApis({
    limit: 500,
  },
  function getRestApis(err, result) {
    if (err) callback(err)
    else {

      var hasStaging = result.items.find(i=> i.name === staging)
      var hasProduction = result.items.find(i=> i.name === production)
      var stage = hasStaging? skip.bind({}, staging) : create.bind({}, staging)
      var prod = hasProduction? skip.bind({}, production) : create.bind({}, production)

      series([
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
