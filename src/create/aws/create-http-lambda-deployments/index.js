let series = require('run-series')
let assert = require('@smallwins/validate/assert')
let getName = require('../../../util/get-lambda-name')
let create = require('./create')

module.exports = function createHttpLambdas(params, callback) {

  assert(params, {
    app: String,
    route: Array,
    arc: Object
  })

  let method = params.route[0].toLowerCase()
  let path = getName(params.route[1])
  let app = params.app
  let arc = params.arc
  let name = `${method}${path}`
  let staging = `${app}-staging-${name}`
  let production = `${app}-production-${name}`

  series([
    create.bind({}, {app, name, stage: staging, arc}),
    create.bind({}, {app, name, stage: production, arc}),
  ],
  function _done(err) {
    if (err) callback(err)
    else callback()
  })
}
