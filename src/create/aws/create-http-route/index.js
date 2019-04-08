let series = require('run-series')
let assert = require('@smallwins/validate/assert')
let create = require('./create-route')

module.exports = function _createHttpRoute(params, callback) {

  assert(params, {
    app: String,
    route: Array,
  })

  let route = params.route[1]
  let method = params.route[0]
  let type = 'http'
  let staging = create.bind({}, `${params.app}-staging`, route, method, type)
  let production = create.bind({}, `${params.app}-production`, route, method, type)

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
