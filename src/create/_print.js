let chalk = require('chalk')
let _log = require('log-update')
let running = false
let text = ''

function log(txt) {
  text = txt
  let unix = '∙∙∙ ●∙∙ ∙●∙ ∙∙● ∙∙∙'.split(' ')
  let windows = '∙∙∙ .∙∙ ∙.∙ ∙∙. ∙∙∙'.split(' ')
  let frames = process.platform.startsWith('win')? windows : unix
  let i = 0
  if (!running) {
    running = setInterval(function() {
      _log(`${chalk.green(frames[i = ++i % frames.length])} ${text}`)
    }, 125)
  }
}

/**
 * pretty print stuff to stdout
 */
module.exports = {

  skip(section, resource) {
    var skip = chalk.grey('skip')
    var sect = chalk.grey(section)
    var item = chalk.dim.cyan(resource)
    var exis = chalk.grey('exists')
    log(`${skip} ${sect} ${item} ${exis}`)
  },

  create(section, resource) {
    var skip = chalk.green('create')
    var sect = chalk.grey(section)
    var item = chalk.bold.blue(resource)
    log(`${skip} ${sect} ${item}`)
  },

  stop() {
    clearInterval(running)
    _log.clear()
  }
}
