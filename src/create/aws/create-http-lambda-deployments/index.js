let series = require('run-series')
let assert = require('@smallwins/validate/assert')
let getName = require('../../../util/get-lambda-name')
let create = require('./create')

module.exports = function createHttpLambdas(params, callback) {

  assert(params, {
    app: String,
    route: Array,
  })

  let method = params.route[0].toLowerCase()
  let path = getName(params.route[1])
  let app = params.app
  let name = `${method}${path}`
  let staging = `${app}-staging-${name}`
  let production = `${app}-production-${name}`

  series([
    create.bind({}, {app, name, stage: staging}),
    create.bind({}, {app, name, stage: production}),
  ],
  function _done(err) {
    if (err) callback(err)
    else callback()
  })
}
