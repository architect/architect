var aws = require('aws-sdk')
var msg = require('./_messages').ensureCerts

module.exports = function _ensure(domain, callback) {
  var acm = new aws.ACM({region:'us-east-1'})
  acm.listCertificates({
    CertificateStatuses: [
      'ISSUED',
    ]
  },
  function _listCerts(err, result) {
    if (err) throw err
    var staging = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`)
    var production = result.CertificateSummaryList.find(c=> c.DomainName === domain)
    var halt = (typeof staging === 'undefined' || typeof production === 'undefined')
    if (halt) {
      msg({staging, production})
      process.exit(0)
    }
    else {
      callback()
    }
  })
}
