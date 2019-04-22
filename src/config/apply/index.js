let waterfall = require('run-waterfall')
let read = require('../_read')
let write = require('./write')
let report = require('../report')

module.exports = function apply(arc, raw, callback) {
  waterfall([
    read.bind({}, arc, raw),
    write.bind({}, arc, raw),
    report.bind({}, arc, raw),
  ], callback)
}
