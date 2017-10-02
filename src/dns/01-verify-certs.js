var aws = require('aws-sdk')
var msg = require('./_messages').verifyCerts

module.exports = function _verified(domain, callback) {
   (new aws.ACM({region:'us-east-1'})).listCertificates({
     CertificateStatuses: [
       'PENDING_VALIDATION',
     ]
   },
   function(err, result) {
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
  })   // ensure the domain is verified
}
