let aws = require('aws-sdk')
let chalk = require('chalk')
let waterfall = require('run-waterfall')

module.exports = function _create({domain, registrar}, callback) {
  waterfall([
    function createHostedZone(callback) {
      let route53 = new aws.Route53
      route53.createHostedZone({
        CallerReference: `_idx-${Date.now()}`,
        Name: domain,
      }, callback)
    },
    function maybeWriteNameservers(result, callback) {
      console.log({registrar})
      callback(null, result)
    }
  ],
  function done(err, result) {
    if (err) {
      callback(err)
    }
    else {
      // TODO check to see if this domain is registered on amazon
      // if it is update hte name servers
      // otherwise show this message
      var ns = result.create.DelegationSet.NameServers.join('\n')
      var pls = chalk.dim('Please ensure to add these nameservers to your domain registration:')
      console.log(`\n${chalk.dim('Created')} ${chalk.cyan.underline(domain)}\n`)
      console.log(pls)
      console.log(chalk.dim.cyan.underline(ns))
      console.log('\n')
      callback()
    }
  })
}

