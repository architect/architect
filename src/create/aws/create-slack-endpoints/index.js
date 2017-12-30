var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var createCode = require('./_create-code')
var createDeploy = require('./_create-deployment')

module.exports = function _createSlackEndpoints(params, callback) {

  assert(params, {
    app: String,
    bot: String
  })

  createCode(params, function done(err) {
    if (err) throw err

    var staging = createDeploy.bind({}, Object.assign({}, params, {env:'staging'}))
    var production = createDeploy.bind({}, Object.assign({}, params, {env:'production'}))

    parallel([
      staging,
      production
    ],
    function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  })
}

