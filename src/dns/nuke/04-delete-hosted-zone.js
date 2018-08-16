let aws = require('aws-sdk')
let print = require('./_print')
let waterfall = require('run-waterfall')

module.exports = function ({domain, route53}, callback) {
  if (route53) {
    let route53 = new aws.Route53
    waterfall([
      function getHostedZone(callback) {
        route53.listHostedZonesByName({
          DNSName: domain,
          MaxItems: '1',
        }, callback)
      },
      function getRecordSets(result, callback) {
        let exists = result.HostedZones && result.HostedZones.length > 0 && result.HostedZones[0].Name === domain
        if (exists) {
          let HostedZoneId = result.HostedZones[0].Id
          route53.deleteHostedZone({
            Id: HostedZoneId,
          },
          function done(err) {
            //'HostedZoneNotEmpty'
            print(err)
            callback()
          })
        }
        else {
          callback()
        }
      },
    ], callback)
  }
  else {
    callback()
  }
}



