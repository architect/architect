let path = require('path')
let {spawn} = require('child_process')

/**
 * installs modules using package-lock.json
 */
module.exports = function _modules(params, callback) {

  let {pathToCode, tick} = params
  if (tick)
    tick('Installing modules...')

  let lock = path.join(process.cwd(), pathToCode)
  let env = process.env
  let opts = {cwd:lock, shell:true, env}
  let windows = process.platform.startsWith('win')
  let subprocess = spawn(windows? 'npm.cmd' : 'npm', ['ci', '--ignore-scripts'], opts)

  subprocess.on('close', function close() {
    callback()
  })

  subprocess.on('error', function error(err) {
    if (err)
      console.log('npm ci failed', err)
    callback()
  })
}
