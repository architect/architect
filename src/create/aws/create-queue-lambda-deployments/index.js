let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let _create = require('./_create-lambda')

// create staging/production lambdas
module.exports = function _createDeployments(params, callback) {
  assert(params, {
    app: String,
    queue: typeof params.queue === 'object' ? Object : String,
  })
  var name = typeof params.queue === 'object' ? Object.keys(params.queue)[0] : params.queue
  parallel({
    staging(callback) {
      _create({
        app: params.app,
        queue: params.queue,
        name: `${params.app}-staging-${name}`
      }, callback)
    },
    production(callback) {
      _create({
        app: params.app,
        queue: params.queue,
        name: `${params.app}-production-${name}`
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

