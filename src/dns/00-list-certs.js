var aws = require('aws-sdk')
var parallel = require('run-parallel')
var _requestCertificate = require('./_request-certificate')

module.exports = function _acm(domain, callback) {
    ;(new aws.ACM).listCertificates({}, function(err, result) {
      if (err) throw err
      var hasStaging = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`)
      var hasProduction = result.CertificateSummaryList.find(c=> c.DomainName === domain)
      var skip = !!(hasStaging && hasProduction)
      if (skip) {
        callback()
      }
      else {
        //create any.foo.bar and *.any.foo.bar if they do not exist
        parallel([
          _requestCertificate.bind({}, domain),
          _requestCertificate.bind({}, `*.${domain}`),
        ],
        function _done() {
          // exit with a message to rerun this command
          console.log('requested certs pls verify via email and rerun this command to continue')
          process.exit(0)
        })
      }
    })
  }
