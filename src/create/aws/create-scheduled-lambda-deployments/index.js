let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let create = require('./create')

/**
 * create-scheduled-lambda-deployments
 *
 * upsert lambdas wired to cloudwatch event rules
 */
module.exports = function createDeployments(params, callback) {

  assert(params, {
    app: String,      // appname
    scheduled: Array, // ['foo', 'rate(1 day)']
  })

  let app = params.app
  let name = params.scheduled[0]
  let rule = params.scheduled.join(' ').replace(name, '').trim()

  parallel([
    create.bind({}, `${app}-staging-${name}`, name, rule),
    create.bind({}, `${app}-production-${name}`, name, rule),
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
