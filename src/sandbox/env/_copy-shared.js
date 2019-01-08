let chalk = require('chalk')
let copy = require('../../hydrate/shared/_copy')

/**
 * Invokes shared modules copier
 */
module.exports = function _shared(params, callback) {
  let {arc, pathToCode} = params
  copy({arc, pathToCode}, function _done(err) {
    if (err) console.log(err)
    else {
      let g = chalk.green.dim
      let d = chalk.grey
      let total = pathToCode.length
      console.log(g('✓'), d(`Shared code and .arc copied into ${total} Functions`))
      callback()
    }
  })
}
