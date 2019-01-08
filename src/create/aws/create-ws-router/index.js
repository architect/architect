let aws = require('aws-sdk')
let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let create = require('./create')
let list = require('./list')
let skip = require('./skip')

module.exports = function createWebSocketRouter(params, callback) {

  console.log('create-ws-router called with', params)
  assert(params, {
    app: String,
  })

  let staging = `${params.app}-ws-staging`
  let production = `${params.app}-ws-production`

  waterfall([
    function reads(callback) {
      list(callback) 
    },
    function writes(result, callback) {
      console.log('got result' ,result)
      let hasStaging = result.find(i=> i.Name === staging)
      let hasProduction = result.find(i=> i.Name === production)
      let stage = hasStaging? skip.bind({}, staging) : create.bind({}, staging)
      let prod = hasProduction? skip.bind({}, production) : create.bind({}, production)
      parallel([
        stage,
        prod
      ], callback)
    }
  ], 
  function done(err, result) {
    console.log('got result wtf', result)
    if (err) {
      console.log(err)
      callback(err)
    }
    else {
      callback()
    }
  })
}
