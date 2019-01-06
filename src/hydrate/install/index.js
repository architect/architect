let install = require('./_install')
let series = require('run-series')
let shared = require('../shared')
// TODO impl
// let chalk = require('chalk')
// let _progress = require('../../util/progress')

/**
 * Install dependencies for one or many Functions
 *   - pathToCode: single Function operations may be a string
 *                 bulk Function operations must be an array
 */

module.exports = function hydrateInstall(params, callback) {
  let { arc, pathToCode, tick } = params

  // TODO if no tick, impl progress npx hydrate

  // Normalize to array
  if (typeof pathToCode === 'string') pathToCode = [pathToCode]
  // TODO add validation?

  let installing = true

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
    callback()
  })
}
