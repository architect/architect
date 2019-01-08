/**
 * it's a progress... indicator
 */
let chalk = require('chalk')
let _log = require('log-update')

module.exports = function _progress(params) {

  let {name, total} = params
  let count = 0
  let running = false
  let n = ''
  let m = ''

  function log() {
    let unix = '∙∙∙ ●∙∙ ∙●∙ ∙∙● ∙∙∙'.split(' ')
    let windows = '∙∙∙ .∙∙ ∙.∙ ∙∙. ∙∙∙'.split(' ')
    let frames = process.platform.startsWith('win')
      ? windows
      : unix
    let i = 0
    // End-user progress mode
    if (!running && !process.env.CI) {
      running = setInterval(function() {
        _log(`${chalk.cyan(frames[i = ++i % frames.length])} ${n} ${m}`)
      }, 100)
    }
    // CI mode: updates console with status messages but not animations
    else if (!running && process.env.CI && m.length > 0) {
      running = setInterval(function() {
        _log(`${n} ${m}`)
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
    n = chalk.grey(name)
    m = chalk.cyan(msg)
    log()
    if (count === total) stop()
  }

  tick.cancel = stop

  return {
    tick
  }
}
