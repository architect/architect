let aws = require('aws-sdk')
let series = require('run-series')
let init = require('../../util/init')
let isAPI = require('../_is-api')
let _cert = require('./00-certificate')
let _domains = require('./01-domains')

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
