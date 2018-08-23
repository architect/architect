let parse = require('@architect/parser')
let exists = require('path-exists').sync
let spawn = require('child_process').spawn
let path = require('path')
let mkdir = require('mkdirp').sync
let fs = require('fs')
let cp = fs.copyFileSync

module.exports = function _installFunctionsAndData(localPath, callback) {
  let cmd = process.platform.startsWith('win')? 'npm.cmd' : 'npm'
  let args =  ['i', '@architect/functions', '@architect/data', '--ignore-scripts']
  let opts = {cwd:localPath, shell:true}
  let npm = spawn(cmd, args, opts)
  npm.on('close', function win() {
    var pathToLocalArcCopy = path.join(localPath, 'node_modules', '@architect', 'shared')
    mkdir(pathToLocalArcCopy)
    let arcDefaultPath = path.join(process.cwd(), '.arc')
    let arcFinalPath = path.join(pathToLocalArcCopy, '.arc')
    let arcYamlPath = path.join(process.cwd(), 'arc.yaml')
    let arcJsonPath = path.join(process.cwd(), 'arc.json')
    if (exists(arcDefaultPath)) {
      cp(arcDefaultPath, arcFinalPath)
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
    callback()
  })
  npm.on('error', callback)
}
