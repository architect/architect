let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let print = require('./_print')

module.exports = function deleteAliasRecords({domain, route53}, callback) {
  if (route53) {
    let route53 = new aws.Route53
    waterfall([
      function reads(callback) {
        route53.listHostedZonesByName({
          DNSName: domain,
          MaxItems: '1',
        }, callback)
      },
      function verifies(result, callback) {
        let exists = result.HostedZones && result.HostedZones.length > 0
        if (exists) {
          let HostedZoneId = result.HostedZones[0].Id
          callback(null, HostedZoneId)
        }
        else {
          callback(Error(`route53 ${domain} recordset not found`))
        }
      },
      function getsAliasRecords(HostedZoneId, callback) {
        route53.listResourceRecordSets({
          HostedZoneId,
        },
        function done(err, result) {
          if (err) callback(err)
          else {
            let records = result.ResourceRecordSets.filter(r=> r.Type === 'A')
            let staging = records.find(r=> r.Name === `staging.${domain}.`)
            let production = records.find(r=> r.Name === `${domain}.`)
            callback(null, {staging, production, HostedZoneId})
          }
        })
      },
      function deletes({staging, production, HostedZoneId}, callback) {

        let Changes = []

        if (staging) {
          Changes.push({
            Action: 'DELETE',
            ResourceRecordSet: {
              AliasTarget: {
                DNSName: staging.AliasTarget.DNSName,
                EvaluateTargetHealth: false,
                HostedZoneId: 'Z2FDTNDATAQYW2',
              },
              Name: `staging.${domain}`,
              Type: 'A'
            }
          })
        }

        if (production) {
          Changes.push({
            Action: 'DELETE',
            ResourceRecordSet: {
              AliasTarget: {
                DNSName: production.AliasTarget.DNSName,
                EvaluateTargetHealth: false,
                HostedZoneId: 'Z2FDTNDATAQYW2',
              },
              Name: domain,
              Type: 'A'
            }
          })
        }

        if (Changes.length > 0) {
          route53.changeResourceRecordSets({
            HostedZoneId,
            ChangeBatch: {
              Changes,
              Comment: `arc-dns DELETE ${new Date(Date.now()).toISOString()}`
            },
          }, callback)
        }
        else {
          callback()
        }
      }
    ],
    function done(err) {
      print(err) // print errors but do not halt execution
      callback()
    })
  }
  else {
    callback() // silently continue
  }
}
