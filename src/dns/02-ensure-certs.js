var aws = require('aws-sdk')
var acm = new aws.ACM({region:'us-east-1'})
var msg = require('./_messages').ensureCerts

module.exports = function _ensure(domain, callback) {
  acm.listCertificates({
    CertificateStatuses: [
      'INACTIVE',
      'EXPIRED',
      'VALIDATION_TIMED_OUT',
      'REVOKED',
      'FAILED',
    ]
  },
  function _listCerts(err, result) {
    if (err) throw err
    var hasStaging = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`)
    var hasProduction = result.CertificateSummaryList.find(c=> c.DomainName === domain)
    var halt = !!(hasStaging && hasProduction)
    if (halt) {
      msg()
      process.exit(0)
    }
    else {
      callback()
    }
  })
}
