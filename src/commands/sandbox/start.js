let sandbox = require('@architect/sandbox')

module.exports = function sandboxImplementation(opts) {
  let findPort = opt=> opt === '-p' || opt === '--port' || opt === 'port'
  if (opts && opts.some(findPort)) {
    if (opts.indexOf('-p') >= 0)
      process.env.PORT = opts[opts.indexOf('-p') + 1]
    if (opts.indexOf('--port') >= 0)
      process.env.PORT = opts[opts.indexOf('--port') + 1]
    if (opts.indexOf('port') >= 0)
      process.env.PORT = opts[opts.indexOf('port') + 1]
  }
  sandbox.start({disableBanner: true}, function _done(err) {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  })
}
