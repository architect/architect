let assert = require('@smallwins/validate/assert')
let copyArc = require('./_arc')
let copyStatic = require('./_static')
let cp = require('cpr')
let exists = require('path-exists').sync
let fs = require('fs')
let lambdaPath = require('../../util/get-lambda-name')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let join = require('path').join
let sep = require('path').sep
let series = require('run-series')

/**
 * Shared modules copier
 * - Accepts Arc project object and array of relative paths (inventory -> localPaths)
 * - Copies all appropriate and necessary shared files into paths
 */
module.exports = function copyCommon(params, callback) {

  assert(params, {
    arc: Object,
    pathToCode: Array,
    // tick: Function,
  })

  let { arc, pathToCode, tick } = params
  let sharingDisabledPaths = [] // Collects paths with shared modules disabled

  series([
    function _shared(callback) {
      if (tick) tick(`Copying src${sep}shared into Functions...`)
      let src = join(process.cwd(), 'src', 'shared')

      /**
       * Skip copying src/shared early if:
       * - Project doesn't use it
       * - Function opts out with .arc-config
       */
      let hasShared = exists(src) || false
      parallel(pathToCode.map(path => {
        return function _copy(callback) {
          if (path.substr(-1) === sep) path = path.substr(0,path.length-1)

          let enableShared = true
          let arcConfig = join(process.cwd(), path, '.arc-config')
          if (exists(arcConfig)) {
            let config = parse(fs.readFileSync(arcConfig).toString())
            if (config.arc && config.arc.some(s => {
              if (!s[0]) return false
              if (s.includes('shared') && (s.includes(false) || s.includes('disabled') || s.includes('off'))) return true
              return false
            })) {
              enableShared = false
              sharingDisabledPaths.push(path)
            }
          }

          if (enableShared) {
            let dest = join(process.cwd(), path, 'node_modules', '@architect', 'shared')

            series([
              // Maybe copy src/shared to all Functions
              function copyShared(callback) {
                if (hasShared) {
                  copy(src, dest, callback)
                }
                else {
                  callback()
                }
              },
              // Copy .arc to all Functions
              function copyArcFile(callback) {
                copyArc(path, callback)
              },
              // Maybe copy static.json to all Functions
              function copyStaticManifest(callback) {
                copyStatic(path, callback)
              },
            ],
            function done(err) {
              if (err) callback(err)
              else callback()
            })
          }
          else callback()
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
      if (tick) tick(`Copying src${sep}views into Functions...`)

      let src = join(process.cwd(), 'src', 'views')

      // Bail early if project doesn't use src/views
      let hasViews = exists(src)
      if (!hasViews) {
        if (tick) tick('')
        callback()
      }
      else {
        parallel(pathToCode.map(path => {
          return function _copy(callback) {
            if (path.substr(-1) === sep) path = path.substr(0,path.length-1)

            let enableShared = true
            if (sharingDisabledPaths.includes(path)) {
              enableShared = false
            }

            if (enableShared) {
              let dest = join(process.cwd(), path, 'node_modules', '@architect', 'views')

              // @views has entries
              if (arc.views && arc.views.length) {
                let paths = arc.views.map(v => `src${sep}http${sep}${v[0]}${lambdaPath(v[1])}`)
                // If this Function is listed in @views, copy views to it
                if (paths.includes(path)) {
                  copy(src, dest, callback)
                }
                else callback()
              }
              // Otherwise, just copy src/views to all @http GET routes
              else if (path.startsWith(`src${sep}http${sep}get-`)) {
                copy(src, dest, callback)
              }
              else {
                callback()
              }
            }
            else callback()
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
    else callback()
  })
}

// Reusable copier, always overwrites
function copy(source, destination, callback) {
  cp(source, destination, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}
