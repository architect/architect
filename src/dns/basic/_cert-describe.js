let chalk = require('chalk')
let aws = require('aws-sdk')
let msgFirst = require('./_cert-msg-0')
let msg = require('./_cert-msg-1')

/**
 * print out a certificate validation
 */
module.exports = function _describe(CertificateArn, first, callback) {
  let acm = new aws.ACM({region: 'us-east-1'})
  acm.describeCertificate({
    CertificateArn
  },
  function done(err, cert) {
    if (err) callback(err)
    else {
      let options = cert.Certificate.DomainValidationOptions.map(function cleans(r) {
        return {
          name: r.ResourceRecord.Name,
          value: r.ResourceRecord.Value,
          status: r.ValidationStatus,
        }
      })
      if (first) {
        msgFirst(options)
      }
      else {
        msg(options)
      }
      let verified = !options.some(o=> o.status != 'SUCCESS')
      if (verified) {
        callback()
      }
      else {
        console.log(chalk.grey('\nPlease create the CNAME record above with your DNS provider and re-run', chalk.green('npx dns'), 'to continue.'))
        callback(Error('cancel'))
      }
    }
  })
}
