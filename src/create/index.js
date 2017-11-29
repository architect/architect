var fs = require('fs')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var parse = require('@architect/parser')
var validate = require('./aws/validate')
var planner = require('./aws/planner')
var beforeCreate = require('./before-create')
var afterCreate = require('./after-create')
var exec = require('./_exec')

// {arcFile:'path/to/.arc', execute:false} returns .arc execution plan
// {arcFile:'path/to/.arc', execute:true} runs .arc execution plan
module.exports = function generate(params, callback) {

  // validates programmer input
  assert(params, {
    arcFile: String,
    execute: Boolean
  })

  // read, parse, validate, plan and possibly execute
  waterfall([
    function _arcFileRead(callback) {
      fs.readFile(params.arcFile, callback)
    },
    function _arcFileParse(buffer, callback) {
      var arc = parse(buffer.toString())
      callback(null, arc)
    },
    function _arcFileValid(arc, callback) {
      validate(arc, callback)
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
      return callback(err)
    }

    if (params.execute) {
      exec(plans, (err, data) => {
        if (err) {
          callback(err)
        } else {
          afterCreate({arc}, (err) => callback(err, data))
        }
      })
    } else {
      afterCreate({arc}, (err) => callback(err, plans))
    }
  })
}
