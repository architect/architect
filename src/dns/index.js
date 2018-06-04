let assert = require('@smallwins/validate/assert')
let waterfall = require('run-waterfall')
let listCerts = require('./00-list-certs')
let verifyCerts = require('./01-verify-certs')
let ensureCerts = require('./02-ensure-certs')
let createHostedZone = require('./03-create-hosted-zone')
let createDomain = require('./04-create-domain')
let createMapping = require('./05-create-mapping')
let createAlias = require('./06-create-alias')
let success = require('./_success')
let _init = require('../util/init')

function init(callback) {
  _init(function __init(err) {
    if (err) callback(err)
    else callback()
  })
}

function dns(params, callback) {
  assert(params, {
    domain: String,
    app: String,
  })
  let {domain, app} = params
  waterfall([
    init,
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
  let app = 'testapp'
  let domain = 'wut.click'
  dns({app, domain}, console.log)
}
