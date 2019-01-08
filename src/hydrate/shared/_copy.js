let assert = require('@smallwins/validate/assert')
let copyArc = require('./_arc')
let cp = require('cpr')
let exists = require('path-exists').sync
let lambdaPath = require('../../util/get-lambda-name')
let parallel = require('run-parallel')
let series = require('run-series')

/**
 * Shared modules copier
 *   - Accepts Arc project object and array of relative paths (inventory -> localPaths)
 *   - Copyies all appropriate and necessary shared files into paths
 */
module.exports = function copyCommon(params, callback) {

  assert(params, {
    arc: Object,
    pathToCode: Array,
    // tick: Function,
  })

  let { arc, pathToCode, tick } = params

  series([
    function _shared(callback) {
      if (tick) tick(`Copying src/shared into Functions...`)
      let src = process.cwd() + '/src/shared'

      // Skip copying src/shared early if project doesn't use it
      let shared = false
      if (exists(src)) shared = true
      parallel(pathToCode.map(path => {
        return function _copy(callback) {
          let dest = process.cwd() + '/' + path + '/node_modules/@architect/shared'

          series([
            // Maybe copy src/shared to all Functions
            function copyShared(callback) {
              if (shared) {
                copy(src, dest, callback)
              }
              else {
                callback()
              }
            },
            // Copy .arc to all Functions
            function copyArcFile(callback) {
              copyArc(path, callback)
            }
          ],
          function done(err) {
            if (err) callback(err)
            else callback()
          })
        }
      }),
      function done(err) {
        if (err) {
          if (tick) tick('')
          callback(err)
        }
        else {
          if (tick) tick('')
          callback()
        }
      })
    },
    function _views(callback) {
      if (tick) tick(`Copying src/views into Functions...`)

      let src = process.cwd() + '/src/views'

      // Bail early if project doesn't use src/views
      if (!exists(src)) {
        if (tick) tick('')
        callback()
      }
      else {
        parallel(pathToCode.map(path => {
          return function _copy(callback) {
            let dest = process.cwd() + '/' + path + '/node_modules/@architect/views'

            // @views has entries
            if (arc.views && arc.views.length) {
              let paths = arc.views.map(v => `src/http/${v[0]}${lambdaPath(v[1])}`)
              // If this Function is listed in @views, copy views to it
              if (paths.includes(path)) {
                copy(src, dest, callback)
              }
              else callback()
            }
            // Otherwise, just copy src/views to all @http GET routes
            else if (path.startsWith('src/http/get-')) {
              copy(src, dest, callback)
            }
            else {
              callback()
            }
          }
        }),
        function done(err) {
          if (err) {
            if (tick) tick('')
            callback(err)
          }
          else {
            if (tick) tick('')
            callback()
          }
        })
      }
    }
  ],
  function _done(err) {
    if (err) callback(err)
    callback()
  })
}

// Reusable copier, always overwrites
function copy(source, destination, callback) {
  cp(source, destination, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}
