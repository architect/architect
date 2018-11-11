let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let chalk = require('chalk')
let _describe = require('./_cert-describe')

/**
 * print or create&print a certificate for @domain in ACM
 */
module.exports = function _cert(domain, callback) {
  let acm = new aws.ACM({region: 'us-east-1'})
  waterfall([
    function listCerts(callback) {
      acm.listCertificates({}, callback)
    },
    function describe(result, callback) {
      // display the cert and continue
      let cert = result.CertificateSummaryList? result.CertificateSummaryList.find(c=> c.DomainName === domain) : false
      if (cert) {
        setTimeout(function delay() {
          _describe(cert.CertificateArn, false, callback)
        }, 3*1000)
      }
      else {
        // request a cert and stop execution
        let production = domain
        let staging = `*.${domain}`
        waterfall([
          function requestCert(callback) {
            acm.requestCertificate({
              DomainName: production,
              SubjectAlternativeNames: [staging],
              ValidationMethod: 'DNS',
            }, callback)
          },
          function getCNAMEStuff(result, callback) {
            setTimeout(function delay() {
              _describe(result.CertificateArn, true, callback)
            }, 3*1000)
          }
        ],
        function done(err, result) {
          if (err) callback(err)
          else {
            console.log(result)
            console.log(chalk.grey('\nPlease create the CNAME record above with your DNS provider and re-run', chalk.green('npx dns'), 'to continue.'))
            callback(Error('cancel'))
          }
        })
      }
    }
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
