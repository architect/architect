let cp = require('cpr')
let exists = require('path-exists').sync
let fs = require('fs')
let parse = require('@architect/parser')

/**
 * Arc manifest copier
 * - .arc project file may be needed by Architect dependencies
 * - $function/node_modules/@architect/shared/.arc should always be present
 */
module.exports = function copyArc(pathToCode, callback) {
  // Normalize to absolute paths
  let dest
  if (pathToCode.startsWith('src/')) {
    dest = process.cwd() + '/' + pathToCode + '/node_modules/@architect/shared'
  }
  else {
    dest = pathToCode + '/node_modules/@architect/shared'
  }
  let arcFileDest = dest + '/.arc'

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

// Reusable copier, always overwrites
function copy(source, destination, callback) {
  cp(source, destination, {overwrite: true}, function done(err) {
    if (err) callback(err)
    else callback()
  })
}
