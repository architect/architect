let assert = require('@smallwins/validate/assert')
let parse = require('@architect/parser')
let exists = require('path-exists').sync
let parallel = require('run-parallel')
let series = require('run-series')
let join = require('path').join
let fs = require('fs')
let cp = require('cpr')

let copyArc = require('./_arc')
let lambdaPath = require('../../util/get-lambda-name')

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

  let {arc, pathToCode, tick} = params

  series([
    function _shared(callback) {
      if (tick)
        tick(`Copying src/shared into Functions...`)

      let src = join(process.cwd(), 'src', 'shared')

      // use later to skip copying src/shared early if project doesn't use it
      let shared = exists(src)

      parallel(pathToCode.map(path => {
        return function _copy(callback) {

          // node ..... ./node_modules
          // python ... ./vendor
          // ruby ..... ./vendor
          let vendor = false
          let pathToConfig = join(process.cwd(), path, '.arc-config')
          if (shared && exists(pathToConfig)) {
            let raw = fs.readFileSync(pathToConfig).toString()
            let config = parse(raw)
            let runtime = config.aws && config.aws.find(t=> t[0] === 'runtime')
            if (runtime && runtime[1] != 'node') vendor = runtime[1]
          }

          let node = join(process.cwd(), path, 'node_modules', '@architect', 'shared')
          let other = join(process.cwd(), path, 'vendor', 'shared')
          let dest = vendor? other : node

          series([
            // Maybe copy src/shared to all Functions
            function copyShared(callback) {
              if (shared) copy(src, dest, callback)
              else callback()
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
      if (tick)
        tick(`Copying src/views into Functions...`)

      let src = join(process.cwd(), 'src', 'views')

      // Bail early if project doesn't use src/views
      if (!exists(src)) {
        if (tick) tick('')
        callback()
      }
      else {
        parallel(pathToCode.map(path => {
          return function _copy(callback) {
            //let dest = process.cwd() + '/' + path + '/node_modules/@architect/views'

          // node ..... ./node_modules
          // python ... ./vendor
          // ruby ..... ./vendor
          let vendor = false
          let pathToConfig = join(process.cwd(), path, '.arc-config')
          if (exists(pathToConfig)) {
            let raw = fs.readFileSync(pathToConfig).toString()
            let config = parse(raw)
            let runtime = config.aws && config.aws.find(t=> t[0] === 'runtime')
            if (runtime && runtime[1] != 'node') vendor = runtime[1]
          }

          let node = join(process.cwd(), path, 'node_modules', '@architect', 'views')
          let other = join(process.cwd(), path, 'vendor', 'views')
          let dest = vendor? other : node

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
          if (tick) tick('')
          callback(err? err : null)
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
