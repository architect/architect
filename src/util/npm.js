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

let running = 0
let limit = process.env.ARC_MAX_NPMS ? parseInt(process.env.ARC_MAX_NPMS) : 16
let queue = []

function enqueue(pathToCode, args, callback) {
  queue.push([pathToCode, args, callback])
  shift()
}

function shift() {
  if (queue.length > 0 && running < limit) {
    const [pathToCode, args, callback] = queue.shift()
    running += 1
    npm(pathToCode, args, err => {
      running -= 1
      process.nextTick(shift)
      callback(err)
    })
  }
}

module.exports = enqueue
