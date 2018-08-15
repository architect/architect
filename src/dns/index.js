let basic = require('./basic')
let route53 = require('./route53')
let nuke = require('./nuke')

module.exports = {
  basic, // create a cert and then use that to setup apigateway custom domains and mappings
  route53, // create nameservers, a cert request and setup a CNAME for self issued cert, setup A records for staging and production in route53 plus the above)
  nuke // delete certs, domains, mappings, a records and cnames
}
