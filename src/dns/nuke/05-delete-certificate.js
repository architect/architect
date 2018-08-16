let waterfall = require('run-waterfall')
let aws = require('aws-sdk')
let print = require('./_print')
let chalk = require('chalk')

module.exports = function ({domain}, callback) {
  let acm = new aws.ACM({region: 'us-east-1'})
  waterfall([
    function listCerts(callback) {
      acm.listCertificates({}, callback)
    },
    function getCert(result, callback) {
      let cert = result.CertificateSummaryList? result.CertificateSummaryList.find(c=> c.DomainName === domain) : false
      if (cert) {
        acm.deleteCertificate({
          CertificateArn: cert.CertificateArn
        },
        function done(err) {
          if (err && err.code === 'ResourceInUseException') {
            console.log(chalk.yellow('Warning: unable to delete certificate because AWS thinks it still is in use.\nPlease wait a few minutes and try re-running', chalk.green.bold('ARC_NUKE=route53 npx dns nuke'), 'to ensure it is destroyed.'))
          }
          if (err && err.code != 'ResourceInUseException') {
            print(err)
          }
          callback()
        })
      }
      else {
        // no CERT to delete
        callback()
      }
    },
  ], callback)
}


