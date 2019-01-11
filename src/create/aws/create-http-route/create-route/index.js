var assert = require('@smallwins/validate/assert')
var series = require('run-series')
var create = require('./create-resource')

module.exports = function _createRoute(params, callback) {

  assert(params, {
    app: String,
    route: Array,
    type: String,
  })

  var route = params.route[1]
  var method = params.route[0]
  var type = params.type

  var staging = create.bind({}, `${params.app}-staging`, route, method, type)
  var production = create.bind({}, `${params.app}-production`, route, method, type)

  series([
    staging,
    production
  ],
  function _done(err) {
    if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}
