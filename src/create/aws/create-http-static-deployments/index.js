let assert = require('@smallwins/validate/assert')
let series = require('run-series')
let create = require('./create')

module.exports = function createS3Buckets(params, callback) {
  assert(params, {
    static: Array
  })
  series([
    create.bind({}, params.app, params.static[0][1]),
    create.bind({}, params.app, params.static[1][1])
  ],
  function _done(err) {
    if (err) callback(err)
    else callback()
  })
}
