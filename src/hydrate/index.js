let glob = require('glob')
let parallel = require('run-parallel')
let chalk = require('chalk')
let _progress = require('../util/progress')
let npm = require('../util/npm')
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
      let pattern = 'src/shared/**/package.json'
      glob(pattern, callback)
    },
    views(callback) {
      // any folders under views with package.json
      let pattern = 'src/views/**/package.json'
      glob(pattern, callback)
    }
  },
  function _glob(err, all) {
    if (err)  {
      callback(err)
    }
    else {
      // clean up shared + views by removing 'package.json' and paths that include node_modules
      let allCommon = all.shared.concat(all.views)
      let common = allCommon.map(p=> p.replace('package.json', '')).filter(e=> !e.includes('node_modules'))
      let results = [].concat(all.lambdas).concat(common)
      // two ticks per install/update
      let total = results.length*2

      // Installing modules in src/shared, src/views, and 9 Functions
      let lambdas = all.lambdas.length
      let shared = all.shared.length > 0 ? 'src/shared, ' : ''
      let views = all.views.length > 0 ? 'src/views, ' : ''
      let and = all.shared.length > 0 || all.views.length > 0 ? 'and ' : ''
      progress = _progress({
        name: `${banner} in ${shared}${views}${and}${lambdas} Function${results.length > 1? 's':''}`,
        total
      })
      // exec the fn in parallel across all folders
      parallel(results.map(pathToCode=> {
        return function _install(callback) {
          let args = [(installing? 'install' : 'update'), '--ignore-scripts']
          progress.tick()
          npm(pathToCode, args, err => {
            progress.tick()
            callback(err)
          })
        }
      }),
      function(err) {
        if (err) throw err
        let ts = Date.now() - start
        console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim(`${installing ? 'Installed' : 'Updated'} dependencies in ${ts}ms`)}`)
        callback()
      })
    }
  })
}
