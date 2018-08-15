let waterfall = require('run-waterfall')
let aws = require('aws-sdk')
let print = require('./_print')

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
          print(err)
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


