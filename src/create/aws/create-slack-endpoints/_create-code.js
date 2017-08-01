var fs = require('fs')
var exists = require('file-exists').sync
var mkdir = require('mkdirp').sync
var join = require('path').join
var cp = require('cp').sync
var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')

/**
 * creates:
 *
 *  /
 *  |-src
 *  | |-slack
 *  | | '-botname <----------------------- localName
 *  | |   |-actions
 *  | |   | |-index.js
 *  | |   | '-package.json <-------------- w name set to appname-slack-botname-actions
 *  | |   |-events
 *  | |   |-slash
 *  | |   '-options
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
  function copy(part) {
    var dest = `src/slack/${botName}-${part}/index.js`
    if (!exists(dest)) {
      var src = join(__dirname, 'tmpl', part, 'index.js')
      cp(src, dest)
      var pkg = join(process.cwd(), 'src', 'slack', `${botName}-${part}`, 'package.json')
      var name = `${appName}-slack-${botName}-${part}`
      var str = val=> JSON.stringify({name:val}, null, 2)
      fs.writeFileSync(pkg, str(name))
    }
  }

  copy('actions')
  copy('events')
  copy('options')
  copy('slash')

  // cont
  callback()
}

