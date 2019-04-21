let waterfall = require('run-waterfall')
let inventory = require('../../inventory')
let read = require('./00-read')
let validate = require('./01-validate')
let print = require('./02-pretty-print')

module.exports = function report(arc, raw, callback) {
  waterfall([
    inventory.bind({}, arc, raw),
    read.bind({}, arc, raw),
    validate.bind({}, arc, raw),
    print.bind({}, arc, raw),
  ], callback)
}
