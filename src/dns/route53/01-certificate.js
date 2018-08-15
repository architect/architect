let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let chalk = require('chalk')
let _describe = require('./_cert-describe')

/**
 * show a cert for this domain if it exists
 * otherwise create one and show that
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
        _describe({
          first: false,
          domain,
          CertificateArn: cert.CertificateArn,
        }, callback)
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
              _describe({
                first: true,
                domain,
                CertificateArn: result.CertificateArn,
              }, callback)
            }, 3*1000)
          }
        ],
        function done(err, result) {
          if (err) callback(err)
          else {
            console.log(result)
            console.log(chalk.grey('\nCreated CNAME records but it may take a few minutes to verify the cert. Re-run', chalk.green('npx dns'), 'to continue.'))
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
