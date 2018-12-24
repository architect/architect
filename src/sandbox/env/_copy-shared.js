let exists = require('path-exists').sync
let chalk = require('chalk')
let glob = require('glob')
let path = require('path')
let pattern = require('../../util/glob-lambdas')
let parallel = require('run-parallel')
let cpr = require('cpr')

/**
 * copies ./src/shared into ./node_modules/@architect/shared/
 */
module.exports = function _shared(callback) {

  let src = path.join(process.cwd(), 'src', 'shared')
  if (!exists(src)) {
    callback()
  }
  else {
    let fns = glob.sync(pattern).map(pathToCode=> {
      return function copy(callback) {
        let dest = path.join(process.cwd(), pathToCode, 'node_modules', '@architect', 'shared')
        cpr(src, dest, {overwrite: true}, callback)
      }
    })

    parallel(fns, function noop(err) {
      if (err) console.log(err)
      let g = chalk.green.dim
      let d = chalk.grey
      console.log(g('✓'), d('src/shared copied to lambda node_modules/@architect/shared'))
      callback()
    })
  }
}
