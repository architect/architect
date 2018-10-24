// deps
var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')

// local deps
var _getName = require('./_get-function-name')
var uploadZip = require('./06-upload-zip')
var afterDeploy = require('./07-after-deploy')
var done = require('./08-done')

module.exports = function deploy(params, callback) {

  // module contract
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
  })

  // local state
  // - env; one of staging or production
  // - arc; the parsed .arc file contents
  // - pathToCode; absolute path to the lambda function being deployed
  // - tick; function to notify progress
  // - lambda; the name of the lambda being deployed
  let {env, arc, pathToCode, tick} = params
  let lambda = _getName({env, pathToCode, arc})

  // binds local state above to the functions below
  const _upload = uploadZip.bind({}, {pathToCode, lambda, tick})
  const _after = afterDeploy.bind({}, {env, pathToCode, arc, tick})
  const _done = done.bind({}, {arc, env, pathToCode, lambda, callback, tick})

  // executes the functions above
  // in series sharing no state between them
  waterfall([
    _upload,
    _after,
  ], _done)
}
