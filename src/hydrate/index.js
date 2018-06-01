let path = require('path')
let glob = require('glob')
let parallel = require('run-parallel')
let spawn = require('child_process').spawn
let chalk = require('chalk')
let progress = require('progress')
let bar

/**
 * install/update all node_modules for all lambdas in src
 */
module.exports = {
  install: _initDeps.bind({}, true),
  update: _initDeps.bind({}, false),
}

/**
 * runs either install or update function on all lambdas
 */
function _initDeps(installing, callback) {
  let exec = installing? _install : _update
  let banner = chalk.dim.cyan(installing? 'Installing' : 'Updating')
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
          exec(pathToCode, callback)
        }
      }),
      function(err) {
        if (err) throw err
        let ts = Date.now() - start
        console.log(chalk.grey(chalk.cyan('✓'), `Success ${ts}ms`))
        callback()
      })
    }
  })
}

/**
 * installs modules into one path
 */
function _install(pathToCode, callback) {

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

/**
 * updates modules into one path
 */
function _update(pathToCode, callback) {

  let cwd = path.join(process.cwd(), pathToCode)
  let win = process.platform.startsWith('win')
  let cmd = win? 'npm.cmd' : 'npm'
  let args = ['update', '--ignore-scripts']
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
