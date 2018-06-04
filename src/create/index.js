/* eslint global-require:"off" */
var waterfall = require('run-waterfall')
var validate = require('./validate')
var planner = require('./_planner')
var exec = require('./_exec')
var runPluginFunction = require('../util/runPluginFunction')

function afterCreate(params, callback) {
  runPluginFunction(params, 'afterCreate')
    .then(() => callback())
    .catch(callback)
}

function beforeCreate(params, callback) {
  runPluginFunction(params, 'beforeCreate')
    .then(() => callback())
    .catch(callback)
}

module.exports = function create(arc, raw, callback) {
  waterfall([
    function _arcFileValid(callback) {
      validate(arc, raw, callback)
    },
    function _beforeCreate(arc, callback) {
      beforeCreate({arc}, (err) => callback(err, arc))
    },
    function _arcFilePlan(arc, callback) {
      var plans = planner(arc)
      callback(null, {arc, plans})
    }
  ],
  function _done(err, {arc, plans}) {
    if (err) {
      callback(err)
    }
    else {
      exec(plans, function _exec(err, data) {
        if (err) {
          callback(err)
        }
        else {
          afterCreate({arc}, err=> callback(err, data))
        }
      })
    }
  })
}
