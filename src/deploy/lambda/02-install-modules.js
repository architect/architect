var chalk = require('chalk')
var path = require('path')
var spawn = require('child_process').spawn

/**
 * cipm install modules using package-lock.json
 */
module.exports = function _modules(params, callback) {
  let {pathToCode} = params
  let lock = path.join(process.cwd(), pathToCode)
  let p = spawn('npm', ['ci', '--ignore-scripts'], {cwd:lock, shell:true,})
  p.on('close', function win() {
    if (params.tick) params.tick()
    callback()
  })
  p.on('error', function fail(err) {
    callback(err)
  })
}
