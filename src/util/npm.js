let path = require('path')
let spawn = require('child_process').spawn

// helper function for running npm in a particular directory
function npm(pathToCode, args, callback) {
  let cwd = pathToCode.startsWith('/') ? pathToCode : path.join(process.cwd(), pathToCode)
  // normalize pathToCode for error messages
  pathToCode = pathToCode.replace(process.cwd() + '/', '')
  let win = process.platform.startsWith('win')
  let cmd = win? 'npm.cmd' : 'npm'
  let options = {cwd, shell:true}
  let subprocess = spawn(cmd, args, options)
  let stderr = []
  subprocess.stderr.on('data', chunk => stderr.push(chunk))
  subprocess.on('exit', function close(code) {
    callback(code !== 0 ? new Error(`npm ${args.join(' ')} in ${pathToCode} exited with code ${code}\n${Buffer.concat(stderr).toString()}`) : null)
  })
  subprocess.on('error', function fail(err) {
    callback(err)
  })
}

module.exports = npm
