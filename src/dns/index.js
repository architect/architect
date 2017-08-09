var waterfall = require('run-waterfall')
var listCerts = require('./00-list-certs')
var verifyCerts = require('./01-verify-certs')
var ensureCerts = require('./02-ensure-certs')
var createHostedZone = require('./03-create-hosted-zone')

var domain = 'wut.click'

waterfall([
  listCerts.bind({}, domain),
  verifyCerts.bind({}, domain),
  ensureCerts.bind({}, domain),
  createHostedZone.bind({}, domain),
  function _apigateway(callback) {
    //create domain name
    //create base path mapping
  },
  function _glue(callback) {
    //route53 change resource set (create the alias)
  }
])
