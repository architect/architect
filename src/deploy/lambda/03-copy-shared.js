let parse = require('@architect/parser')
let exists = require('path-exists').sync
let path = require('path')
let fs = require('fs')
let series = require('run-series')
let cp = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(params, callback) {

  let {pathToCode} = params
  let src = path.join(process.cwd(), 'src', 'shared')
  let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  let arcFileSrc = path.join(process.cwd(), '.arc')
  let arcFileDest = path.join(dest, '.arc')

  series([
    function copyShared(callback) {
      cp(src, dest, {overwrite:true}, callback)
    },
    function copyArc(callback) {
      let arcYamlPath = path.join(process.cwd(), 'arc.yaml')
      let arcJsonPath = path.join(process.cwd(), 'arc.json')
      if (exists(arcFileSrc)) {
        cp(arcFileSrc, arcFileDest, {overwrite:true}, callback)
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
    if (params.tick) params.tick()
    // move along
    if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}

