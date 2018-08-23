let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let createResources = require('./_create-resources')

module.exports = function _maybeCreateResources(stage, route, type, callback) {

  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  let restApiId

  waterfall([
    function _getAPI(callback) {
      // h/t to @kj for finding this limit
      gateway.getRestApis({
        limit: 500
      }, callback)
    },
    function _createResources(apis, callback) {
      let api = apis.items.find(i=> i.name === stage)
      restApiId = api.id // reused below (declared above!)
      createResources(restApiId, route, type, callback)
    }
  ],
  function _done(err) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, restApiId)
    }
  })
}
