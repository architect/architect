let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let _create = require('./_domains-create')
let _print = require('./_domains-describe')

/**
 * print or create&print domain.com and staging.domain.com in apigateway
 */
module.exports = function _domains(app, domain, callback) {
  let gw = new aws.APIGateway({region: process.env.AWS_REGION})
  waterfall([
    function getDomains(callback) {
      gw.getDomainNames({
        limit: 500,
      }, callback)
    },
    function displayOrCreateDomains(result, callback) {
      let staging = result.items.find(d=> d.domainName === `staging.${domain}`)
      let production = result.items.find(d=> d.domainName === domain)
      if (staging && production) {
        _print({
          staging,
          production
        })
        callback()
      }
      else {
        _create({
          domain,
          app,
        }, callback)
      }
    }
  ], callback)
}


