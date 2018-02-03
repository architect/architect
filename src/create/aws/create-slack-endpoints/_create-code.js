var fs = require('fs')
var exists = require('file-exists').sync
var mkdir = require('mkdirp').sync
var join = require('path').join
var cp = require('cp').sync
var parallel = require('run-parallel')
var assert = require('@smallwins/validate/assert')
var exec = require('child_process').exec

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
      exec(`
        cd ${curr} && \
        npm i slack --production --save && \
        cd ${home}
      `,
      function(){
        callback()
      })
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

