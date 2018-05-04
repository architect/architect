var aws = require('aws-sdk')
var parallel = require('run-parallel')
var gw = new aws.APIGateway

function _create(name, arn, callback) {
  gw.createDomainName({
    domainName: name,
    certificateArn: arn,
  },
  function _create(err) {
    if (err) throw err
    callback()
  })
}

module.exports = function createDomain(domain, callback) {
  // list domains
  gw.getDomainNames({
    limit: 500,
  },
  function _list(err, data) {
    if (err) throw err
    // look for domain.com and staging.domain.com
    var hasStaging = data.items.find(r=> r.domainName === `staging.${domain}`)
    var hasProduction = data.items.find(r=> r.domainName === domain)
    var skip = hasStaging || hasProduction
    if (skip) {
      callback()
    }
    else {
      // need to create staging and/or production
      // first, read certs
      (new aws.ACM({region:'us-east-1'})).listCertificates({
        CertificateStatuses: ['ISSUED'],
      },
      function(err, result) {
        if (err) throw err
        // then create staging and production
        var staging = `staging.${domain}`
        var production = domain
        var stagingArn = result.CertificateSummaryList.find(c=> c.DomainName === `*.${domain}`).CertificateArn
        var productionArn = result.CertificateSummaryList.find(c=> c.DomainName === domain).CertificateArn

        var creates = []
        if (!hasStaging) {
          creates.push(_create.bind({}, staging, stagingArn))
        }
        if (!hasProduction) {
          creates.push(_create.bind({}, production, productionArn))
        }
        parallel(creates, function _done(err) {
          if (err) throw err
          callback()
        })
      })
    }
  })
}

