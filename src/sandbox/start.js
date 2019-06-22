let sandbox = require('@architect/sandbox')
let ver = require('../../package.json').version

module.exports = function sandboxStart(params) {
  params = params || {}
  params.version = `Architect ${ver}`
  sandbox.start(params, function _done(err) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  })
}
