let _deleteBasePathMappings = require('./00-delete-base-path-mappings')
let _deleteDomainNames = require('./01-delete-domain-names')
let _deleteAliasRecords = require('./02-delete-alias-records')
let _deleteCNAMERecords = require('./03-delete-cname-records')
let _deleteHostedZone = require('./04-delete-hosted-zone')
let _deleteCertificate = require('./05-delete-certificate')

var aws = require('aws-sdk')
let init = require('../../util/init')
let series = require('run-series')
let isAPI = require('../_is-api')
let chalk = require('chalk')

module.exports = function nukeDNS(parms, callback) {
  if (!callback) callback = function noop() {}
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
      // get our bearings
      //let app = arc.app[0]
      let domain = arc.domain[0]
      let route53 = process.env.ARC_NUKE === 'route53'

      // FORCE the use of AWS_REGION and AWS_PROFILE which we set in init
      var credentials = new aws.SharedIniFileCredentials({
        profile: process.env.AWS_PROFILE
      })
      aws.config.credentials = credentials

      // bind domain and giver
      let deleteBasePathMappings = _deleteBasePathMappings.bind({}, {domain})
      let deleteDomainNames = _deleteDomainNames.bind({}, {domain})
      let deleteAliasRecords = _deleteAliasRecords.bind({}, {domain, route53})
      let deleteCNAMERecords = _deleteCNAMERecords.bind({}, {domain, route53})
      let deleteHostedZone = _deleteHostedZone.bind({}, {domain, route53})
      let deleteCertificate = _deleteCertificate.bind({}, {domain})

      series([
        deleteBasePathMappings,
        deleteDomainNames,
        deleteAliasRecords,
        deleteCNAMERecords,
        deleteHostedZone,
        deleteCertificate,
      ],
      function done(err) {
        if (err) callback(err) // surface any errors
        else {
          console.log(chalk.grey('Successfully destroyed DNS configuration'))
          callback() // silently continue
        }
      })
    }
  })
}
