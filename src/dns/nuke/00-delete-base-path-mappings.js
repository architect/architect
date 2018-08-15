let aws = require('aws-sdk')
let parallel = require('run-parallel')
let print = require('./_print')

module.exports = function deleteBasePathMappings({domain}, callback) {
  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  parallel({
    staging(callback) {
      gateway.deleteBasePathMapping({
        basePath: '(none)',
        domainName: `staging.${domain}`,
      },
      function done(err) {
        if (err && err.code != 'NotFoundException')
          print(err) // print errors but do not halt execution
        callback()
      })
    },
    production(callback) {
      gateway.deleteBasePathMapping({
        basePath: '(none)',
        domainName: domain,
      },
      function done(err) {
        if (err && err.code != 'NotFoundException')
          print(err) // print errors but do not halt execution
        callback()
      })
    }
  }, callback)
}
