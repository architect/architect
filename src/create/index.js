let series = require('run-series')
let validate = require('./validate')
let planner = require('./_planner')
let exec = require('./_exec')
let plugin = require('../util/run-plugin')

module.exports = function create(arc, raw, callback) {
  series([
    function reads(callback) {
      validate(arc, raw, callback)
    },
    function before(callback) {
      plugin('beforeCreate', {arc}, callback)
    },
    function writes(callback) {
      let plans = planner(arc)
      exec(plans, callback)
    },
    function after(callback) {
      plugin('afterCreate', {arc}, callback)
    },
  ], callback)
}
