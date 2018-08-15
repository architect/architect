// let chalk = require('chalk')
let aws = require('aws-sdk')
let msgFirst = require('./_cert-msg-0')
let msg = require('./_cert-msg-1')
let _createCNAME = require('./_cert-cname-create')

// prints out the cert request cname values
// if not verified attempts to create the cname values
module.exports = function _describe({domain, CertificateArn, first}, callback) {
  let acm = new aws.ACM({region: 'us-east-1'})
  acm.describeCertificate({
    CertificateArn
  },
  function done(err, result) {
    if (err) callback(err)
    else {
      // pretty print the validation cert cname info
      let fmt = r=> ({name: r.ResourceRecord.Name, value: r.ResourceRecord.Value, status: r.ValidationStatus})
      let options = result.Certificate.DomainValidationOptions.map(fmt)
      let print = first? msgFirst : msg
      print(options)
      // check to see if hte cert is verified
      let verified = !options.some(o=> o.status != 'SUCCESS')
      if (verified) {
        // our work is done here
        callback()
      }
      else {
        _createCNAME({
          domain,
          Certificate: result.Certificate
        }, callback)
      }
    }
  })
}
