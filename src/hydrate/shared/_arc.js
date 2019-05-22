let cp = require('cpr')
let exists = require('path-exists').sync
let fs = require('fs')
let parse = require('@architect/parser')
let join = require('path').join
let sep = require('path').sep

/**
 * Arc manifest copier
 * - .arc project file may be needed by Architect dependencies
 * - $function/node_modules/@architect/shared/.arc should always be present
 */
module.exports = function copyArc(pathToCode, callback) {
  // Normalize to absolute paths
  let dest
  if (pathToCode.startsWith(`src${sep}`)) {
    dest = join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
  }
  else {
    dest = join(pathToCode, 'node_modules', '@architect', 'shared')
  }
  let arcFileDest = join(dest, '.arc')

  let arcFileSrc = join(process.cwd(), '.arc')
  let arcAppDotArcPath = join(process.cwd(), 'app.arc')
  let arcYamlPath = join(process.cwd(), 'arc.yaml')
  let arcJsonPath = join(process.cwd(), 'arc.json')
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
