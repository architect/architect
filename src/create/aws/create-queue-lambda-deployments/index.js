let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let _create = require('./_create-lambda')

// create staging/production lambdas
module.exports = function _createDeployments(params, callback) {
  assert(params, {
    app: String,
    queue: String,
  })
  parallel({
    staging(callback) {
      _create({
        app: params.app,
        queue: params.queue,
        name: `${params.app}-staging-${params.queue}`
      }, callback)
    },
    production(callback) {
      _create({
        app: params.app,
        queue: params.queue,
        name: `${params.app}-production-${params.queue}`
      }, callback)
    },
  },
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}

