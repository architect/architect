let assert = require('@smallwins/validate/assert')
let series = require('run-series')
let proxy = require('./proxy')

/**
 * catch any 404 and point it at get-index
 */
module.exports = function fallback(params, callback) {
  assert(params, {
    app: String,//app name
    arc: Object,
  })
  series([
    proxy.bind({}, 'staging', params),
    proxy.bind({}, 'production', params),
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
