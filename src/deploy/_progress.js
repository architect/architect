var Progress = require('progress')

/**
 * its a progress bar
 */
module.exports = function _progress(params, callback) {
  if (!callback) callback = x=> !x
  return new Progress(`${params.name} :bar `, {
    width: 40,
    complete: '\u001b[46m \u001b[0m',
    incomplete: '\u001b[40m \u001b[0m',
    total: params.total,
    clear: true,
    callback,
  })
}
