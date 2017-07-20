/* eslint global-require:"off" */
var waterfall = require('run-waterfall')

/**
 * _exec accepts an array of plans and executes them in series
 */
module.exports = function _exec(plans, callback) {
  var fns = plans.map(function _plan(plan) {
    return function _handle(callback) {
      var handler = require(`./aws/${plan.action}`)
      handler(plan, callback)
    }
  })
  waterfall(fns, callback)
}
