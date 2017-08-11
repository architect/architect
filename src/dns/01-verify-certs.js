var aws = require('aws-sdk')

module.exports = function _verified(domain, callback) {
   (new aws.ACM).listCertificates({
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
      console.log('certificates pending verification; check your email and follow the instructions to verify the certificates and then re-run this command to continue')
      process.exit(0)
    }
    else {
      callback()
    }
  })   // ensure the domain is verified
}
