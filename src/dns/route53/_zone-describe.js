let aws = require('aws-sdk')
let chalk = require('chalk')
//let waterfall = require('run-waterfall')
//let parallel = require('run-parallel')

module.exports = function _print({domain, registrar, HostedZoneId}, callback) {
  console.log(chalk.dim.green('✔ Route53 Hosted Zone'))
  console.log(`                     ${chalk.green.bold.underline(domain)}`)
  console.log('')
  let ns = registrar? registrar.Nameservers : []
  let exec = registrar?  _awsRegistrar : _thirdPartyRegistrar
  exec({
    ns,
    domain,
    HostedZoneId,
  }, callback)
}

function _awsRegistrar({ns, domain, HostedZoneId}, callback) {
  let route53 = new aws.Route53
  route53.listResourceRecordSets({
    HostedZoneId,
    StartRecordType: 'NS',
    StartRecordName: domain,
  },
  function done(err, result) {
    if (err) callback(err)
    else {
      var zoneNameservers = result.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(x=> x.Value).sort().join('\n')
      let registrarNameservers = ns.map(fmt).sort().join('\n')
      let verifiedNameservers = zoneNameservers === registrarNameservers
      if (verifiedNameservers) {
        console.log(chalk.dim.green('✔ Verified Nameservers'))
        let nameservers = zoneNameservers.split('\n')
        nameservers.forEach(ns=> {
          console.log(`                     ${chalk.green(ns)}`)
        })
        callback()
      }
      else {
        let Nameservers = result.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(r=> ({Name: r.Value}))
        let route53domains = new aws.Route53Domains
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
            let nameservers = zoneNameservers.split('\n')
            nameservers.forEach(ns=> {
              console.log(`                     ${chalk.green(ns)}`)
            })
            callback()
          }
        })
      }
    }
  })
}

function fmt(n) {
  let hasTrailingPeriod = n.Name.split('').reverse()[0] === '.'
  return hasTrailingPeriod? n.Name : `${n.Name}.`
}

function _thirdPartyRegistrar({domain, HostedZoneId}, callback) {
  var route53 = new aws.Route53
  route53.listResourceRecordSets({
    HostedZoneId,
    StartRecordType: 'NS',
    StartRecordName: domain,
  },
  function _listRecordSets(err, data) {
    if (err) callback(err)
    else {
      var ns = data.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(x=> x.Value).join('\n')
      console.log(chalk.dim('Please ensure your domain registration is using these nameeservers:'))
      console.log(chalk.dim.cyan.underline(ns))
      console.log('\n')
      callback()
    }
  })
}
