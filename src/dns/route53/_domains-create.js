let aws = require('aws-sdk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')
let _create = require('./_domain-create')
let _print = require('./_domains-describe')

// creates staging and production domains
module.exports = function _domainsCreate(params, callback) {

  let {domain, app} = params

  let gw = new aws.APIGateway({region: process.env.AWS_REGION})
  let acm = new aws.ACM({region: 'us-east-1'})

  waterfall([
    // get the cert and the restapiid
    function reads(callback) {
      parallel({
        cert(callback) {
          acm.listCertificates({}, callback)
        },
        apis(callback) {
          gw.getRestApis({
            limit: 500,
          }, callback)
        }
      }, callback)
    },
    function createDomains(result, callback) {
      let certificateArn = result.cert.CertificateSummaryList.find(c=> c.DomainName === domain).CertificateArn
      let staging = result.apis.items.find(i=> i.name === `${app}-staging`).id
      let production = result.apis.items.find(i=> i.name === `${app}-production`).id
      parallel({
        staging(callback) {
          _create({
            certificateArn,
            domainName: `staging.${domain}`,
            restApiId: staging,
            stage: 'staging',
          }, callback)
        },
        production(callback) {
          _create({
            certificateArn,
            domainName: domain,
            restApiId: production,
            stage: 'production',
          }, callback)
        }
      }, callback)
    },
    function getDomainNamesAgain(result, callback) {
      setTimeout(function delay() {
        gw.getDomainNames({
          limit: 500,
        }, callback)
      }, 10*1000)
    },
    function showUsWhatYouGot(result, callback) {
      let staging = result.items.find(d=> d.domainName === `staging.${domain}`)
      let production = result.items.find(d=> d.domainName === domain)
      _print({
        staging,
        production
      })
      callback()
    }
  ],
  function done(err) {
    if (err) callback(err)
    else {
      callback()
    }
  })
}
