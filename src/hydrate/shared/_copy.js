let cp = require('cpr')
let exists = require('path-exists').sync
let fs = require('fs')
let lambdaPath = require('../../util/get-lambda-name')
let parallel = require('run-parallel')
let parse = require('@architect/parser')
let series = require('run-series')

module.exports = function copyCommon(params, callback) {
  let {arc, pathToCode, tick} = params

  series([
    function _shared(callback) {
      if (tick) tick(`Copying src/shared into Functions...`)

      let src = process.cwd() + '/src/shared'

      // Bail early if project doesn't use src/shared
      if (!exists(src)) {
        callback()
      }
      else {
        parallel(pathToCode.map(path => {
          return function _copy(callback) {
            let dest = process.cwd() + '/' + path + '/node_modules/@architect/shared'
            let arcFileDest = dest + '/.arc'

            series([
              // Copy src/shared to all functions
              function copyShared(callback) {
                copy(src, dest, callback)
              },
              function copyArc(callback) {
                // Possible .arc manifest locations
                let arcFileSrc = process.cwd() + '/.arc'
                let arcAppDotArcPath = process.cwd() + '/app.arc'
                let arcYamlPath = process.cwd() + '/arc.yaml'
                let arcJsonPath = process.cwd() + '/arc.json'
                if (exists(arcFileSrc)) {
                  copy(arcFileSrc, arcFileDest, callback)
                }
                else if (exists(arcAppDotArcPath)) {
                  copy(arcAppDotArcPath, arcFileDest, callback)
                }
                else if (exists(arcYamlPath)) {
                  let raw = fs.readFileSync(arcYamlPath).toString()
                  let arc = parse.yaml.stringify(raw)
                  fs.writeFileSync(arcFileDest, arc)
                  callback()
                }
                else if (exists(arcJsonPath)) {
                  let raw = fs.readFileSync(arcJsonPath).toString()
                  let arc = parse.json.stringify(raw)
                  fs.writeFileSync(arcFileDest, arc)
                  callback()
                }
              }
            ],
            function done(err) {
              if (err) callback(err)
              else callback()
            })
          }
        }),
        function done(err) {
          if (err) callback(err)
          else callback()
        })
      }
    },
    function _views(callback) {
      if (tick) tick(`Copying src/views into Functions...`)

      let src = process.cwd() + '/src/views'

      // Bail early if project doesn't use src/views
      if (!exists(src)) {
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
              else {
                callback()
              }
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
          if (err) callback(err)
          else callback()
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
