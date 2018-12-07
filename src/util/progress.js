/**
 * it's a progress... indicator
 */
let chalk = require('chalk')
let _log = require('log-update')

module.exports = function _progress(params) {

  let {name, total} = params
  let count = 0
  let running = false
  let text = ''

  function log(txt) {
    text = txt
    let unix = '∙∙∙ ●∙∙ ∙●∙ ∙∙● ∙∙∙'.split(' ')
    let windows = '∙∙∙ .∙∙ ∙.∙ ∙∙. ∙∙∙'.split(' ')
    let frames = process.platform.startsWith('win')? windows : unix
    let i = 0
    if (!running && !process.env.CI) {
      running = setInterval(function() {
        _log(`${chalk.cyan(frames[i = ++i % frames.length])} ${text}`)
      }, 100)
    }
  }

  /**
   * pretty print stuff to stdout
   */
  function stop() {
    _log.clear()
    clearInterval(running)
  }

  function tick(msg) {
    msg = msg || ''
    count += 1
    var msg = chalk.cyan(msg)
    log(`${chalk.grey(name)} ${msg}`)
    if (count === total) stop()
  }

  tick.cancel = stop

  return {
    tick
  }
}
