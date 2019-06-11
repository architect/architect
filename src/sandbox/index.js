let sandbox = require('@architect/sandbox')
let version = require('../../package.json').version

module.exports = function sandboxImplementation(opts) {
  process.env.ARC_VERSION = `Architect ${version}`
  let findPort = opt=> opt === '-p' || opt === '--port' || opt === 'port'
  if (opts && opts.some(findPort)) {
    if (opts.indexOf('-p') >= 0)
      process.env.PORT = opts[opts.indexOf('-p') + 1]
    if (opts.indexOf('--port') >= 0)
      process.env.PORT = opts[opts.indexOf('--port') + 1]
    if (opts.indexOf('port') >= 0)
      process.env.PORT = opts[opts.indexOf('port') + 1]
  }
  sandbox.start()
}
