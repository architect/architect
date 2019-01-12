let assert = require('@smallwins/validate/assert')
let series = require('run-series')
let list = require('./list-rest-apis')
let deploy = require('./deploy')

module.exports = function createRouters(params, callback) {

  assert(params, {
    app: String,
  })

  list(function listed(err, result) {
    if (err) callback(err)
    else {

      let stagingID = result.items.find(i=> i.name === `${params.app}-staging`).id
      let productionID = result.items.find(i=> i.name === `${params.app}-production`).id

      series([
        deploy.bind({}, {restApiId:stagingID, stageName:'staging'}),
        deploy.bind({}, {restApiId:productionID, stageName:'production'}),
      ],
      function create(err) {
        if (err) callback(err)
        else callback()
      })
    }
  })
}
