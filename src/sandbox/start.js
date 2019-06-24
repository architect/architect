let sandbox = require('@architect/sandbox')
let ver = require('../../package.json').version

module.exports = function sandboxStart(params, callback) {
  params = params || {}
  params.version = `Architect ${ver}`
  if (!callback) return sandbox.start(params)
  else sandbox.start(params, callback)
}
