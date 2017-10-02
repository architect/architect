var aws = require('aws-sdk')
var parallel = require('run-parallel')
var _requestCertificate = require('./_request-certificate')
var msg = require('./_messages').listCerts
var acm = new aws.ACM({region:'us-east-1'})

module.exports = function _acm(domain, callback) {
  acm.listCertificates({}, function(err, result) {
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
        msg(domain)
        process.exit(0)
      })
    }
  })
}
