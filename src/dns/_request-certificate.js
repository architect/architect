var aws = require('aws-sdk')

module.exports = function _requestCertificate(name, callback) {
  // need to suss out the apex to send the cert req to
  var apex = name.split('.')
  var tld = apex.pop() //FIXME this does not work for co.uk or other dot delimated tlds
  var base = apex.pop()
  apex = `${base}.${tld}` // good enuf for now
  // req the cert
  ;(new aws.ACM({region:'us-east-1'})).requestCertificate({
    DomainName: name,
    DomainValidationOptions: [{
      DomainName: name,
      ValidationDomain: apex,
    }],
  },
  function _reqCert(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
