let waterfall = require('run-waterfall')
let read = require('../_read')
let validate = require('./00-validate')
let print = require('./01-pretty-print')

module.exports = function report(arc, raw, callback) {
  waterfall([
    read.bind({}, arc, raw),
    validate.bind({}, arc, raw),
    print,
  ], callback)
}
