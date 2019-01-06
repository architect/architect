let chalk = require('chalk')
let copy = require('./_copy.js')
let exists = require('path-exists')
let glob = require('glob')
let npm = require('../providers/npm')
let parallel = require('run-parallel')
let _progress = require('../../util/progress')
let progress
let cli

/**
 * Shared code + dependencies hydrator
 *
 * function signature:
 *   hydrate.shared({
 *     installing: true,  // installing == true, updating == false
 *     arc: {}            // Arc project object
 *     pathToCode: []     // array of relative paths to operate on (see: inventory -> localPaths)
 *   }, callback)
 */

module.exports = function shared(params, callback) {
  let { arc, installing, pathToCode, start, tick } = params

  let cwd = process.cwd()

  // NPM specific pattern
  // Note: glob uses ** to recurse, not **/*
  let npmPattern = '/**/package.json'

  parallel({
    shared(callback) {
      let sharedPath = cwd + '/src/shared'
      let hasShared = exists(sharedPath)
      if (hasShared)
        glob(sharedPath + npmPattern, callback)
      else callback()
    },
    views(callback) {
      let viewsPath = cwd + '/src/views'
      let hasViews = exists(viewsPath)
      if (hasViews)
        glob(viewsPath + npmPattern, callback)
      else callback()
    }
  },
  function _glob(err, all) {
    if (err) {
      callback(err)
    }
    else {
      // Clean up:
      //  - remove 'package.json' (that's where we're installing to)
      //  - remove any paths that include node_modules
      let allCommon = all.shared.concat(all.views)
      let results = allCommon.map(p => p.replace('package.json', '')).filter(e => !e.includes('node_modules'))

      // One tick per install/update, one to complete
      let total = results.length+1

      // Report: 'Installing modules in src/shared and src/views'
      let action = (installing ? 'Installing' : 'Updating') + ' dependencies'
      let shared = all.shared.length > 0 ? 'src/shared' : ''
      let views = all.views.length > 0 ? 'src/views' : ''
      let and = all.shared.length > 0 && all.views.length > 0 ? ' and ' : ''
      let msg = `${action} in ${shared}${and}${views}`
      if (!tick) {
        cli = true
        progress = _progress({
          name: 'Hydrating:',
          total
        })
        tick = progress.tick
      }
      tick(msg)

      // Build out the queue of dependencies that need hydrating
      let queue = []
      parallel(results.map(path => {
        return function _enqueue(callback) {

          // NPM specific impl: default to ci for package installation
          let args = [(installing? 'ci' : 'update'), '--ignore-scripts']

          // NPM specific impl: check to see if package-lock exists; if not, do a normal install instead of CI, otherwise npm fails
          exists(path + '/package-lock.json')
            .then(exists => {
              if (installing && !exists) {
                args[0] = 'install'
                queue.push([path, args])
                callback()
              }
              // Caveat: npm update doesn't throw errors if you have an invalid package-lock.json file because reasons
              else {
                queue.push([path, args])
                callback()
              }
            })
            .catch(err => console.log(err))
        }
      }),
      function(err) {
        if (err) {
          callback(err)
        }
        npm(queue, err => {
          if (err) {
            callback(err)
          }
          else {
            tick('')
            let ts = Date.now() - start
            if (cli) console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim(`${installing ? 'Installed' : 'Updated'} shared dependencies in ${ts}ms`)}`)
            copy({arc, pathToCode, tick}, callback)
          }
        })
      })
    }
  })
}
