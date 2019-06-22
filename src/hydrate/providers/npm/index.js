let exists = require('path-exists').sync
let parallel = require('run-parallel')
let path = require('path')
let spawn = require('child_process').spawn

/**
 * NPM dependency processor
 *   - Generic
 *   - Accepts an array of commands
 *   - Maintains its own command queue and operation concurrency
 *
 * Command array format:
 * [ [ '/absolute/path/to/dir/containing/package/',
 *   [ 'install', '--ignore-scripts' ] ],
 * ]
 */

// Setup
let running = 0
let limit = process.env.ARC_MAX_NPM
  ? parseInt(process.env.ARC_MAX_NPM)
  : 10
let queue

module.exports = function npmQueue(commands, callback) {
  queue = commands
  exec(callback)
}

function exec(callback) {
  let errors = []
  parallel(queue.map(command => {
    // Spins up as many fns as there are commands, but doesn't care which command is run
    return function _npm(callback) {
      if (command) !!command // linter noop
      function run() {
        // Keep trying to refill the queue as it drains
        if (!(queue.length > 0 && running < limit)) {
          setTimeout(run, 500)
        }
        else {
          const [pathToCode, args] = queue.shift()
          // CYA in case somehow the local Function directory isn't present
          // NPM will catch its own failures related to missing or munged package[-lock] files
          let dir = exists(pathToCode)
          if (!dir) {
            errors.push(`Directory not found: ${pathToCode}`)
            callback()
          }
          else {
            // Add the operation to the queue
            running += 1
            npm(pathToCode, args, function done(err, npmErr) {
              if (err) callback(err)
              else {
                // Collect any NPM errors along the way, but don't halt parallel
                if (npmErr) errors.push(npmErr)
                running -= 1
                callback()
              }
            })
          }
        }
      }
      run()
    }
  }),
  function _done(err) {
    if (err) callback(err) // Exit immediately on any child process errors
    else if (errors.length > 0) callback(errors.join('\n')) // NPM errors
    else callback(null)
  })
}

// NPM operations
function npm(pathToCode, args, callback) {
  let cwd = pathToCode.startsWith(process.cwd())
    ? pathToCode
    : path.join(process.cwd(), pathToCode)
  let win = process.platform.startsWith('win')
  let cmd = win
    ? 'npm.cmd'
    : 'npm'
  let options = {cwd, shell:true}
  // Normalize and make relative pathToCode for error messages
  pathToCode = pathToCode.replace(process.cwd() + path.sep, '')
  let subprocess = spawn(cmd, args, options)
  let stderr = []
  subprocess.stderr.on('data', function data(chunk) {
    stderr.push(chunk)
  })
  subprocess.on('exit', function exit(code) {
    // Deal with NPM errors in userland
    let npmErr
    if (code !== 0) {
      npmErr = new Error(`npm ${args.join(' ')} in ${pathToCode} exited with code ${code}\n  ${Buffer.concat(stderr).toString().split('\n').join('\n  ')}`)
    }
    callback(null, npmErr)
  })
  // Deal with child process errors
  subprocess.on('error', function fail(err) {
    callback(err)
  })
}
