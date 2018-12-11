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

  let stderr = []
  subprocess.stderr.on('data', chunk => stderr.push(chunk))
  subprocess.on('exit', function close(code) {
    callback(code !== 0 ? new Error(`npm ci in ${lock} exited with code ${code}\n${Buffer.concat(stderr).toString()}`) : null)
  })

  subprocess.on('error', function error(err) {
    if (err)
      console.log('npm ci failed', err)
    callback()
  })
}
