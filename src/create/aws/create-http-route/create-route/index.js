let waterfall = require('run-waterfall')
let create = require('./00-create-resources')
let addMethod = require('./01-add-method')
let setupRequest = require('./02-setup-request')
let setupResponse = require('./03-setup-response')
let getName = require('../../../../util/get-lambda-name')

module.exports = function _createResource(stage, route, httpMethod, type, callback) {

  let deployname = `${stage}-${httpMethod}${getName(route)}`

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
