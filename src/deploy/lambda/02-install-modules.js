var path = require('path')
var spawn = require('child_process').spawn

/**
 * cipm install modules using package-lock.json
 */
module.exports = function _modules(params, callback) {
  let {pathToCode} = params
  let lock = path.join(process.cwd(), pathToCode)
  // uses qdd dep to install modules after too many troubles with npm ci
  let qdd = path.join(process.cwd(), 'node_modules', 'qdd', 'index.js')
  let p = spawn(qdd, [], {cwd:lock, shell:true,})
  p.on('close', function win() {
    if (params.tick) params.tick()
    callback()
  })
  p.on('error', function fail(err) {
    callback(err)
  })
}
