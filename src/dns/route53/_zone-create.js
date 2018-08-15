let aws = require('aws-sdk')
let chalk = require('chalk')
let waterfall = require('run-waterfall')

module.exports = function _create({domain}, callback) {
  waterfall([
    function createHostedZone(callback) {
      let route53 = new aws.Route53
      route53.createHostedZone({
        CallerReference: `_idx-${Date.now()}`,
        Name: domain,
      }, callback)
    },
    function maybeWriteNameservers(result, callback) {
      let route53domains = new aws.Route53Domains
      route53domains.getDomainDetail({
        DomainName: domain
      },
      function done(err, resp) {
        if (err) callback(err)
        else if (resp && resp.DomainName === domain) {
          // automatically add the nameservers
          let Nameservers = resp.Nameservers
          route53domains.updateDomainNameservers({
            DomainName: domain,
            Nameservers,
          },
          function done(err) {
            if (err && err.code != 'DuplicateRequest') {
              callback(err) // bubble errors; swallow re-run throttle exceptions
            }
            else {
              console.log(chalk.dim.green('✔ Updated Nameservers'))
              callback()
            }
          })
        }
        else {
          var ns = result.DelegationSet.NameServers.join('\n')
          console.log(chalk.dim(`Created`, chalk.cyan.underline(domain)))
          console.log(chalk.dim('Please ensure to add these nameservers to your domain registration:'))
          console.log(chalk.dim.cyan.underline(ns))
          callback()
        }
      })
    }
  ], callback)
}

