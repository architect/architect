let assert = require('@smallwins/validate/assert')
let chalk = require('chalk')
let install = require('./_install')
let _progress = require('../../util/progress')
let progress
let series = require('run-series')
let shared = require('../shared')

/**
 * Install dependencies for one or many Functions
 *   - pathToCode: single Function operations may be a string
 *                 bulk Function operations must be an array
 */
module.exports = function hydrateInstall(params, callback) {

  assert(params, {
    arc: Object,
    pathToCode: Array,
    // start: Number,
    // tick: Function,
  })

  let { arc, pathToCode, start, tick } = params

  // Normalize to array in case it's a single path passed from deploy
  if (typeof pathToCode === 'string') pathToCode = [pathToCode]

  // Install shouldn't use deploy start as a timer
  if (!start) start = Date.now()

  // Progress
  // - 2 ticks for install
  // - 2 for shared
  // - 4 for shared/copy
  let total = 8
  if (!tick) {
    progress = _progress({
      name: 'Hydrating:',
      total
    })
    tick = progress.tick
  }

  const installing = true

  series([
    function _install(callback) {
      install({arc, pathToCode, tick}, callback)
    },
    function _shared(callback) {
      shared({installing, arc, pathToCode, tick}, callback)
    },
  ],
  function _done(err) {
    if (err) callback(err)
    else {
      let ts = Date.now() - start
      console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim(`Installed all dependencies in ${ts}ms`)}`)
      callback()
    }
  })
}
