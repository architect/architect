var exists = require('path-exists').sync
var mkdir = require('mkdirp').sync
let path = require('path')
var join = path.join
var fs = require('fs')
var cp = fs.copyFileSync
var parallel = require('run-parallel')
var assert = require('@smallwins/validate/assert')
let npm = require('../../../util/npm')


/**
 * creates:
 *
 *  /
 *  |-src
 *  | |-slack
 *  | | |-botname-actions
 *  | | | |-index.js
 *  | | | '-package.json <-------------- w name set to appname-slack-botname-actions
 *  | | |-botname-events
 *  | | |-botname-slash
 *  | | '-botname-options
 */
module.exports = function createSlackLambdaCode(params, callback) {

  assert(params, {
    app: String,
    bot: String,
  })

  var botName = params.bot
  var appName = params.app

  // create dirs if they don't exist
  mkdir(`src/slack/${botName}-actions`)
  mkdir(`src/slack/${botName}-events`)
  mkdir(`src/slack/${botName}-options`)
  mkdir(`src/slack/${botName}-slash`)

  // copy in hello worlds if they don't exist
  function copy(part, callback) {
    var dest = `src/slack/${botName}-${part}/index.js`
    if (!exists(dest)) {
      var src = join(__dirname, 'tmpl', part, 'index.js')
      cp(src, dest)
      var home = process.cwd()
      var curr = join(home, 'src', 'slack', `${botName}-${part}`)
      var pkg = join(curr, 'package.json')
      var name = `${appName}-slack-${botName}-${part}`
      var str = val=> JSON.stringify({name:val}, null, 2)
      fs.writeFileSync(pkg, str(name))
      install(curr, callback)
    }
    else {
      callback()
    }
  }

  parallel([
    copy.bind({}, 'actions'),
    copy.bind({}, 'events'),
    copy.bind({}, 'options'),
    copy.bind({}, 'slash'),
  ], callback)
}

function install(localPath, callback) {
  npm(localPath, ['i', 'slack', '@architect/data', '--ignore-scripts'], err => {
    var pathToLocalArcCopy = path.join(localPath, 'node_modules', '@architect', 'shared')
    mkdir(pathToLocalArcCopy)
    cp(path.join(process.cwd(), '.arc'), path.join(pathToLocalArcCopy, '.arc'))
    callback(err) // propagate npm error to caller
  })
}