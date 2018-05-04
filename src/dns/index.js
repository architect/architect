var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var listCerts = require('./00-list-certs')
var verifyCerts = require('./01-verify-certs')
var ensureCerts = require('./02-ensure-certs')
var createHostedZone = require('./03-create-hosted-zone')
var createDomain = require('./04-create-domain')
var createMapping = require('./05-create-mapping')
var createAlias = require('./06-create-alias')
var success = require('./_success')

function dns(params, callback) {
  assert(params, {
    domain: String,
    app: String,
  })
  var {domain, app} = params
  waterfall([
    listCerts.bind({}, domain),
    verifyCerts.bind({}, domain),
    ensureCerts.bind({}, domain),
    createHostedZone.bind({}, domain),
    createDomain.bind({}, domain),
    createMapping.bind({}, app, domain),
    createAlias.bind({}, app, domain),
    success.bind({}, app, domain),
  ], callback)
}

module.exports = dns

if (require.main === module) {
  var app = 'testapp'
  var domain = 'wut.click'
  dns({app, domain}, console.log)
}
