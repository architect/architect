var aws = require('aws-sdk')
var route53 = new aws.Route53

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
      console.log(`found hosted zone ${domain}\n`)
      //console.log(result)
      // list the nameservers 
      route53.listResourceRecordSets({
        HostedZoneId: result.HostedZones[0].Id,
        StartRecordType: 'NS',
        StartRecordName: domain,
      }, 
      function(err, data) {
        if (err) throw err
        console.log(`make sure these nameservers are setup:`)
        console.log(data.ResourceRecordSets.find(t=> t.Type === 'NS').ResourceRecords.map(x=> x.Value).join('\n'))
        callback()
      })
    }
    else {
      console.log('hosted zone not found creating')
      route53.createHostedZone({
        CallerReference: `_idx-${Date.now()}`,
        Name: domain,
      }, 
      function _created(err, data) {
        if (err) throw err
          // FIXME check to see if this domain is registered on amazon
          // if it is update hte name servers
          // otherwise show this message
        console.log(`created ${domain}`)
        console.log('please ensure to add these nameservers to your domain registration:')
        console.log(data.DelegationSet.NameServers.join('\n'))
        callback()
      })
    }
  })
}
