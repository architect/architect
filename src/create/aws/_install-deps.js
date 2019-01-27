let providers = require('../../hydrate/providers')
/**
 * installs initial deps according to runtime
 *
 * expects params:
 *
 * - absolutePath
 * - relativePath
 * - arc
 * - app
 * - idx
 */
module.exports = function installer(params, callback) {
  let packager = 'node'
  let runtime = params.arc.aws && params.arc.aws.find(t=> t[0] === 'runtime')
  if (runtime) {
    let val = runtime[1]
    let allowed = Object.keys(providers)
    if (allowed.includes(val))
      packager = val
  }
  providers[packager].create(params, callback)
}
