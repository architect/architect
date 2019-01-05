let parse = require('@architect/parser')
let exists = require('path-exists').sync
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let cp = fs.copyFileSync
// FIXME update this to the proper API
let npm = require('../../hydrate/providers/npm')

module.exports = function _installFunctionsAndData(localPath, callback) {
  npm(localPath, ['i', '@architect/functions', '@architect/data', '--ignore-scripts'], err => {
    let pathToLocalArcCopy = path.join(localPath, 'node_modules', '@architect', 'shared')
    mkdir(pathToLocalArcCopy)
    let arcDefaultPath = path.join(process.cwd(), '.arc')
    let arcAppDotArcPath = path.join(process.cwd(), 'app.arc')
    let arcFinalPath = path.join(pathToLocalArcCopy, '.arc')
    let arcYamlPath = path.join(process.cwd(), 'arc.yaml')
    let arcJsonPath = path.join(process.cwd(), 'arc.json')
    if (exists(arcDefaultPath)) {
      cp(arcDefaultPath, arcFinalPath)
    }
    else if (exists(arcAppDotArcPath)) {
      cp(arcAppDotArcPath, arcFinalPath)
    }
    else if (exists(arcYamlPath)) {
      let raw = fs.readFileSync(arcYamlPath).toString()
      let arc = parse.yaml.stringify(raw)
      fs.writeFileSync(path.join(pathToLocalArcCopy, '.arc'), arc)
    }
    else if (exists(arcJsonPath)) {
      let raw = fs.readFileSync(arcJsonPath).toString()
      let arc = parse.json.stringify(raw)
      fs.writeFileSync(path.join(pathToLocalArcCopy, '.arc'), arc)
    }
    callback(err) // propagate npm error to caller
  })
}
