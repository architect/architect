// deps
let assert = require('@smallwins/validate/assert')
let waterfall = require('run-waterfall')

// local deps
let validate = require('./00-validate')
let beforeDeploy = require('./01-before-deploy')
let hydrate = require('../../hydrate').install

module.exports = function deploy(params, callback) {

  // module contract
  assert(params, {
    env: String,
    arc: Object,
    pathToCode: String,
    tick: Function,
    hydrateDeps: Boolean,
  })

  // local state
  // - env; one of staging or production
  // - arc; the parsed .arc file contents
  // - pathToCode; path to the Function being deployed
  // - tick; function to notify progress
  // - hydrateDeps; skips hydration steps if all Functions are being deployed
  let {env, arc, pathToCode, tick, hydrateDeps} = params

  // binds local state above to the functions below
  const _validate = validate.bind({}, {pathToCode, tick})
  const _before = beforeDeploy.bind({}, {env, pathToCode, arc, tick})
  const _hydrate = hydrateDeps
    ? hydrate.bind({}, {arc, pathToCode, tick})
    : callback => { callback() } // noop

  // executes the functions above
  // in series sharing no state between them
  waterfall([
    _validate,
    _before,
    _hydrate,
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
