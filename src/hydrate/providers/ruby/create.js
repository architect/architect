let path = require('path')
let fs = require('fs')
let spawn = require('child_process').spawnSync
let mkdir = require('mkdirp').sync
let copyCommon = require('../../shared/_copy')

// if ruby we write
// - .arc-config
// - Gemfile
// - .bundle/config
// - run bundle install
// - generates…a whole bunch of stuff
// - src/shared --------> architect/shared
// - src/views ---------> architect/views
// - src/shared/.arc ---> architect/shared/.arc
// ensure .arc-config
module.exports = function ruby(params, callback) {

  let {absolutePath, relativePath, arc} = params

  fs.writeFileSync(path.join(absolutePath, '.arc-config'), `@aws
runtime ruby2.5
timeout 3
memory 1152`)

  let GemFile = `source "https://rubygems.org"
gem "architect-functions"`
  fs.writeFileSync(path.join(absolutePath, 'GemFile'), GemFile)

  let bundle = path.join(absolutePath, '.bundle')
  mkdir(bundle)
  let config = `---
BUNDLE_PATH: "vendor"`
  fs.writeFileSync(path.join(bundle, 'config'), config)

  let options = {cwd:absolutePath, shell:true}
  spawn('bundle', ['install'], options)

  copyCommon({
    arc,
    pathToCode: [relativePath]
  }, callback)
}
