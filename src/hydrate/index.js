let path = require('path')
let glob = require('glob')
let parallel = require('run-parallel')
let spawn = require('child_process').spawn
let chalk = require('chalk')
let _progress = require('../util/progress')
let progress

/**
 * install/update all node_modules for all lambdas in src
 */
module.exports = {
  install: _initDeps.bind({}, true),
  update: _initDeps.bind({}, false),
}

/**
 * runs either install or update function on all lambdas and shared modules
 */
function _initDeps(installing, callback) {
  let exec = installing? _install : _update
  let banner = chalk.dim.cyan((installing ? 'Installing' : 'Updating') + ' modules')
  let start = Date.now()
  // do two glob calls; one for src/lambdas and one for src/shared
  parallel({
    lambdas(callback) {
      /*
         TODO At some point in the future we'll refactor this to read .arc instead of glob
         - when we do, take note that Lambda path encoding changed in 4.x when we went from statically bound content type functions to http
         - we added (back) period and dash, and did not reuse chars
         - to maintain backwards compatibility, we'll need to aim legacy functions at a diff path builder
         - see: src/util/get[-legacy]-lambda-name.js
       */
      // all the lambda folders
      let pattern = 'src/@(html|http|css|js|text|xml|json|events|scheduled|tables|slack|queues)/*'
      glob(pattern, callback)
    },
    shared(callback) {
      // any folders under shared with package.json
      let pattern = 'src/shared/**/*/package.json'
      glob(pattern, callback)
    }
  },
  function _glob(err, both) {
    if (err)  {
      callback(err)
    }// clean up shared removing 'package.json' and paths that include node_modules
    else {
      let shared = both.shared.map(p=> p.replace('package.json', '')).filter(e=> !e.includes('node_modules'))
      let results = [].concat(both.lambdas).concat(shared)
      // two ticks per install/update
      let total = results.length*2
      progress = _progress({
        name: `${banner} in ${results.length} Function${results.length > 1? 's':''}`,
        total
      })
      // exec the fn in parallel across all folders
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
  let args = ['i', '--ignore-scripts']
  let options = {cwd, shell:true}
  let subprocess = spawn(cmd, args, options)
  // one tick for opening the process
  progress.tick()
  subprocess.on('close', function win() {
    // and one tick per close
    progress.tick()
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
  progress.tick()
  subprocess.on('close', function win() {
    // and one tick per close
    progress.tick()
    callback()
  })
  subprocess.on('error', function fail(err) {
    callback(err)
  })
}
