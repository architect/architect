let aws = require('aws-sdk')
let chalk = require('chalk')
//let waterfall = require('run-waterfall')
let parallel = require('run-parallel')

module.exports = function _print({domain, registrar, HostedZoneId}, callback) {
  console.log(chalk.dim.green('✔ Route53 Hosted Zone'))
  console.log(`                     ${chalk.green.bold.underline(domain)}`)
  console.log('')
  let registered = registrar && registrar.Domains && registrar.Domains.map(d=> d.DomainName).some(d=> d === domain)
  let exec = registered?  _awsRegistrar : _thirdPartyRegistrar
  exec({
    domain,
    HostedZoneId,
  }, callback)
}

function _awsRegistrar({domain, HostedZoneId}, callback) {
  // get the nameservers
  parallel({
    zone(callback) {
      var route53 = new aws.Route53
      route53.listResourceRecordSets({
        HostedZoneId,
        StartRecordType: 'NS',
        StartRecordName: domain,
      }, callback)
    },
    registrar(callback) {
      let route53domains = new aws.Route53Domains
      route53domains.getDomainDetail({
        DomainName: domain
      }, callback)
    }
  },
  function done(err, result) {
    if (err) callback(err)
    else {
      var zoneNameservers = result.zone.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(x=> x.Value).sort().join('\n')
      let registrarNameservers = result.registrar.Nameservers.map(fmt).sort().join('\n')
      let verifiedNameservers = zoneNameservers === registrarNameservers
      if (verifiedNameservers) {
        console.log(chalk.dim.green('✔ Verified nameservers'))
        let nameservers = zoneNameservers.split('\n')
        nameservers.forEach(ns=> {
          console.log(`                     ${chalk.green(ns)}`)
        })
      }
      else {
        console.log(chalk.dim.yellow('⚠ Nameservers invalid'))
        console.log('expected', chalk.yellow.bold(zoneNameservers))
        console.log('actual', chalk.red.bold(registrarNameservers))
      }
      callback()
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
