var aws = require('aws-sdk')
let init = require('../../util/init')
let series = require('run-series')
let _ns = require('./00-nameservers')
let _cert = require('./01-certificate')
let _domains = require('./02-domains')
let _alias = require('./03-alias')
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
      // FORCE the use of AWS_REGION and AWS_PROFILE which we set in init
      var credentials = new aws.SharedIniFileCredentials({profile: process.env.AWS_PROFILE})
      aws.config.credentials = credentials

      let app = arc.app[0]
      let domain = arc.domain[0]
      let ns = _ns.bind({}, domain)
      let cert = _cert.bind({}, domain)
      let domains = _domains.bind({}, app, domain)
      let alias = _alias.bind({}, domain)

      series([
        ns,
        cert,
        domains,
        alias,
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
