var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var create = require('./00-create-resources')
var addMethod = require('./01-add-method')
var setupRequest = require('./02-setup-request')
var setupResponse = require('./03-setup-response')

module.exports = function _createResource(params, callback) {

  assert(params, {
    env: String,
    route: String,
    type: String,
    deploy: String,
  })

  var stage = `${params.app}-${params.env}`
  var route = params.route
  var type = params.type
  var deployname = params.deploy
  var httpMethod = 'post'

  waterfall([
    function _00(callback) {
      create({
        stage,
        route,
        type,
      }, callback)
    },
    function _01(restApiId, resources, callback) {
      addMethod({
        route,
        httpMethod,
        restApiId,
        resources,
      }, callback)
    },
    function _02(resourceId, restApiId, callback) {
      setupRequest({
        route,
        httpMethod,
        deployname,
        resourceId,
        restApiId,
        type,
      }, callback)
    },
    function _03(resourceId, restApiId, callback) {
      setupResponse({
        httpMethod,
        resourceId,
        restApiId,
        type,
      }, callback)
    }
  ], callback)
}
