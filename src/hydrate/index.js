let path = require('path')
let glob = require('glob')
let parallel = require('run-parallel')
let spawn = require('child_process').spawn
let chalk = require('chalk')
let progress = require('progress')
let bar

/**
 * installs modules into all lambdas
 */
module.exports = function initDeps(callback) {
  let banner = chalk.dim.cyan('Installing')
  let start = Date.now()
  let pattern = 'src/@(html|css|js|text|xml|json|events|scheduled|tables|slack)/*'
  glob(pattern, function _glob(err, results) {
    if (err) callback(err)
    else {
      let total = results.length*2
      let width = 30
      let complete = '\u001b[46m \u001b[0m'
      let incomplete = '\u001b[40m \u001b[0m'
      let clear = true
      bar = new progress(`${banner} :bar`, {total, width, complete, incomplete, clear})
      parallel(results.map(pathToCode=> {
        return function _install(callback) {
          install(pathToCode, callback)
        }
      }),
      function(err) {
        if (err) throw err
        let ts = Date.now() - start
        console.log(chalk.grey(chalk.cyan('✓'), `Successfully installed ${ts}ms`))
        callback()
      })
    }
  })
}

/**
 * installs modules into one path
 */
function install(pathToCode, callback) {

  let cwd = path.join(process.cwd(), pathToCode)
  let win = process.platform.startsWith('win')
  let cmd = win? 'npm.cmd' : 'npm'
  let args = ['ci', '--ignore-scripts']
  let options = {cwd, shell:true}
  let subprocess = spawn(cmd, args, options)
  // one tick for opening the process
  bar.tick()
  subprocess.on('close', function win() {
    // and one tick per close
    bar.tick()
    callback()
  })
  subprocess.on('error', function fail(err) {
    callback(err)
  })
}
