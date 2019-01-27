let path = require('path')
let fs = require('fs')
let spawn = require('child_process').spawnSync
let mkdir = require('mkdirp').sync
let copyCommon = require('../../shared/_copy')

/**
 * create a python lambda
 */
module.exports = function create(params, callback) {

  let {absolutePath, relativePath, arc} = params
  // ensure .arc-config
  fs.writeFileSync(path.join(absolutePath, '.arc-config'), `@aws
runtime python3.7
timeout 3
memory 1152
`)
  // if python we write
  // - requirements.txt
  let reqs = `architect-functions==0.0.1`
  fs.writeFileSync(path.join(absolutePath, 'requirements.txt'), reqs)
  // write a /vendor dir
  let bundle = path.join(absolutePath, 'vendor')
  mkdir(bundle)
  // run the package manager
  let cmd = 'pip'
  let args = ['install', '-r', 'requirements.txt', '--target', './vendor']
  let options = {cwd:absolutePath, shell:true}

  spawn(cmd, args, options)

  copyCommon({
    arc,
    pathToCode: [relativePath]
  }, callback)
}
