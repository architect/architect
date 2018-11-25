/**
 * its a progress..indicator
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
    let frames = [
     	"∙∙∙",
			"●∙∙",
			"∙●∙",
			"∙∙●",
      "∙∙∙",
    ]
    let i = 0
    if (!running && !process.env.CI) {
      running = setInterval(function() {
        _log(`${chalk.cyan(frames[i = ++i % frames.length])} ${text}`)
      }, 125)
    }
  }

  /**
   * pretty print stuff to stdout
   */
  function stop() {
    _log('')
    clearInterval(running)
  }

  function tick(msg) {
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
