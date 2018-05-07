var path = require('path')
var spawn = require('child_process').spawn
var rm = require('rimraf').sync

/**
 * qdd installs modules using package-lock.json
 */
module.exports = function _modules(params, callback) {
  let {pathToCode} = params
  let lock = path.join(process.cwd(), pathToCode)
  // uses qdd dep to install modules after too many troubles with npm ci
  let qdd = path.join(process.cwd(), 'node_modules', 'qdd', 'index.js')
  let env = process.env
  // env.QDD_DEBUG = 1
  // env.QDD_NOCACHE = 1
  rm(path.join(lock, 'node_modules'))

  let p = spawn(qdd, [], {cwd:lock, shell:true, env})

  p.on('close', function win() {
    if (params.tick) params.tick()
    callback()
  })

  p.stderr.on('data', (data) => {
    console.log(`qdd stderr: ${data}`);
  })

  p.stdout.on('data', (data) => {
    console.log(`qdd stdout: ${data}`);
  })

  p.on('error', function fail(err) {
    callback(err)
  })
}
