var waterfall = require('run-waterfall')
var create = require('./00-create-resources')
var addMethod = require('./01-add-method')
var setupRequest = require('./02-setup-request')
var setupResponse = require('./03-setup-response')
var getName = require('../../_get-lambda-name')

module.exports = function _createResource(stage, route, httpMethod, type, callback) {

  var pth = getName(route)
  var deployname = `${stage}-${httpMethod}${pth}`

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
