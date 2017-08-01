var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var resources = require('./_get-resources')
var create = require('./_maybe-create-resources')

module.exports = function _00createResources(params, callback) {
  assert(params, {
    stage: String,
    route: String,
    type: String,
  })
  var tmpRestApiId
  waterfall([
    function _maybeCreate(callback) {
      create(params.stage, params.route, params.type, callback)
    },
    function _getResources(restApiId, callback) {
      tmpRestApiId = restApiId
      resources({restApiId}, callback)
    },
  ],
  function _done(err, resources) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, tmpRestApiId, resources)
    }
  })
}
