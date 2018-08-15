let init = require('../../util/init')
let series = require('run-series')
let _cert = require('./00-certificate')
let _domains = require('./01-domains')
let isAPI = require('../_is-api')

function dns(callback) {
  init(function exec(err, arc) {
    if (err) {
      callback(err)
    }
    else if (!isAPI(arc)) {
      callback('missing one of: @html, @json, @css, @js, @text, @xml, @http')
    }
    else if (!arc.hasOwnProperty('domain')) {
      callback('missing @domain')
    }
    else {
      let app = arc.app[0]
      let domain = arc.domain[0]
      let cert = _cert.bind({}, domain)
      let domains = _domains.bind({}, app, domain)
      series([
        cert,
        domains,
      ],
      function done(err) {
        if (err && err.message === 'cancel') {
          callback()
        }
        else if (err) {
          callback(err)
        }
        else {
          callback()
        }
      })
    }
  })
}

module.exports = dns
