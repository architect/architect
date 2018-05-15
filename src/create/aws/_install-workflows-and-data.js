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
    cp(path.join(process.cwd(), '.arc'), path.join(pathToLocalArcCopy, '.arc'))
    callback()
  })
  npm.on('error', callback)
}
