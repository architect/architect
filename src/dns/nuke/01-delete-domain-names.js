let aws = require('aws-sdk')
let parallel = require('run-parallel')
let print = require('./_print')

module.exports = function deleteDomainNames({domain}, callback) {
  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  parallel({
    staging(callback) {
      gateway.deleteDomainName({
        domainName: `staging.${domain}`,
      },
      function _d(err) {
        if (err && err.code != 'NotFoundException')
          print(err)
        callback()
      })
    },
    production(callback) {
      gateway.deleteDomainName({
        domainName: domain,
      },
      function _d(err) {
        if (err && err.code != 'NotFoundException')
          print(err)
        callback()
      })
    }
  }, callback)
}
