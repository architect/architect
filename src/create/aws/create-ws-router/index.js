let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let series = require('run-series')
let create = require('./create')
let list = require('./list')
let skip = require('./skip')

module.exports = function createWebSocketRouter(params, callback) {

  assert(params, {
    app: String,
  })


  // apis to create
  let staging = {name: params.app, env: 'staging'}
  let production = {name: params.app, env: 'production'}

  waterfall([
    function reads(callback) {
      list(callback)
    },
    function writes(result, callback) {
      let hasStaging = result.find(i=> i.Name === `${params.app}-ws-staging`)
      let hasProduction = result.find(i=> i.Name === `${params.app}-ws-production`)
      let stage = hasStaging? skip.bind({}, staging) : create.bind({}, staging)
      let prod = hasProduction? skip.bind({}, production) : create.bind({}, production)
      series([
        stage,
        prod
      ], callback)
    }
  ],
  function done(err) {
    if (err) callback(err)
    else {
      callback()
    }
  })
}
