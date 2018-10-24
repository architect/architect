// deps
var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')

// local deps
var validate = require('./00-validate')
var beforeDeploy = require('./01-before-deploy')
var installModules = require('./02-install-modules')
var copyShared = require('./03-copy-shared')
var copyViews = require('./04-copy-views')

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
  let {env, arc, pathToCode, tick} = params

  // binds local state above to the functions below
  const _validate = validate.bind({}, {pathToCode, tick})
  const _before = beforeDeploy.bind({}, {env, pathToCode, arc, tick})
  const _modules = installModules.bind({}, {pathToCode, tick})
  const _shared = copyShared.bind({}, {pathToCode, tick})
  const _views = copyViews.bind({}, {pathToCode, tick})

  // executes the functions above
  // in series sharing no state between them
  waterfall([
    _validate,
    _before,
    _modules,
    _shared,
    _views
  ],
  function done(err) {
    if (err) {
      callback(err)
    } else {
      callback(null)
    }
  })
}
