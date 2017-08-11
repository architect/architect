var aws = require('aws-sdk')
var route53 = new aws.Route53
var chalk = require('chalk')
var pls = chalk.dim('Please ensure to add these nameservers to your domain registration:')

module.exports = function createHostedZone(domain, callback) {
  route53.listHostedZonesByName({
    DNSName: domain,
    MaxItems: '1'
  },
  function _list(err, result) {
    if (err) throw err
    var hasOne = result.HostedZones.length === 1
    var isSame = result.HostedZones[0].Name === `${domain}.`
    var skip = hasOne && isSame
    if (skip) {
      var msg = chalk.dim(`Found Route53 hosted zone`)
      console.log(`\n${msg} ${chalk.cyan.underline(domain)}\n`)
      // list the nameservers
      route53.listResourceRecordSets({
        HostedZoneId: result.HostedZones[0].Id,
        StartRecordType: 'NS',
        StartRecordName: domain,
      },
      function(err, data) {
        if (err) throw err
        console.log(pls)
        var ns = data.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(x=> x.Value).join('\n')
        console.log(chalk.dim.cyan.underline(ns))
        callback()
      })
    }
    else {
      route53.createHostedZone({
        CallerReference: `_idx-${Date.now()}`,
        Name: domain,
      },
      function _created(err, data) {
        if (err) throw err
          // TODO check to see if this domain is registered on amazon
          // if it is update hte name servers
          // otherwise show this message
        console.log(`\n${chalk.dim('Created')} ${chalk.cyan.underline(domain)}`)
        console.log(pls)
        console.log(chalk.dim.cyan.underline(data.DelegationSet.NameServers.join('\n')))
        callback()
      })
    }
  })
}
