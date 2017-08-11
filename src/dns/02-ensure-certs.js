var aws = require('aws-sdk')

var CertificateStatuses = [
  'INACTIVE', 
  'EXPIRED', 
  'VALIDATION_TIMED_OUT', 
  'REVOKED', 
  'FAILED',
]

module.exports = function _verified(domain, callback) {
   ;(new aws.ACM).listCertificates({
     CertificateStatuses
   }, 
   function(err, result) {
    if (err) throw err
    var hasStaging = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`)
    var hasProduction = result.CertificateSummaryList.find(c=> c.DomainName === domain)
    var halt = !!(hasStaging && hasProduction)
    if (halt) {
      console.log('certificates in an invalid state; please manually delete the cert and recreate')
      process.exit(0)
    }
    else {
      callback()
    }
  })   // ensure the domain is verified 
}
