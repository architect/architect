var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var createResources = require('./_create-resources')

module.exports = function _maybeCreateResources(stage, route, type, callback) {

  var gateway = new aws.APIGateway
  var restApiId

  waterfall([
    function _getAPI(callback) {
      // h/t to @kj for finding this limit
      gateway.getRestApis({limit: 500}, callback)
    },
    function _createResources(apis, callback) {
      var api = apis.items.find(i=> i.name === stage)
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
