// deps
var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')

// local deps
var _getName = require('./_get-function-name')
var validate = require('./00-validate')
var beforeDeploy = require('./01-before-deploy')
var installModules = require('./02-install-modules')
var copyShared = require('./03-copy-shared')
var uploadZip = require('./05-upload-zip')
var afterDeploy = require('./06-after-deploy')
var done = require('./07-done')

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
  const _validate = validate.bind({}, {pathToCode, tick})
  const _before = beforeDeploy.bind({}, {env, pathToCode, arc, tick})
  const _modules = installModules.bind({}, {pathToCode, tick})
  const _shared = copyShared.bind({}, {pathToCode, tick})
  const _upload = uploadZip.bind({}, {pathToCode, lambda, tick})
  const _after = afterDeploy.bind({}, {env, pathToCode, arc, tick})
  const _done = done.bind({}, {arc, env, pathToCode, lambda, callback, tick})

  // executes the functions above
  // in series sharing no state between them
  waterfall([
    _validate,
    _before,
    _modules,
    _shared,
    _upload,
    _after,
  ], _done)
}
