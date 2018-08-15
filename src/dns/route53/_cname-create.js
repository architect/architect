let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let _reduceResourceRecords = require('./_cert-reduce-resource-records')

module.exports = function _createCNAME({domain, Certificate}, callback) {

  let route53 = new aws.Route53
  let reduced = _reduceResourceRecords({Certificate})
  let HostedZoneId

  waterfall([

    function zone(callback) {
      route53.listHostedZonesByName({
        DNSName: domain,
        MaxItems: '1',
      }, callback)
    },

    function lookForCNAMEinHostedZone(result, callback) {
      HostedZoneId = result.HostedZones[0].Id
      route53.listResourceRecordSets({
        HostedZoneId,
      },
      function done(err,result) {
        if (err) callback(err)
        else if (result.isTruncated) {
          callback(Error('FIXME pagination needed here'))
        }
        else {
          let isCNAME = r=> r.Type === 'CNAME'
          let fmt = r=> ({name: r.Name, value: r.ResourceRecords[0].Value})
          let existing = result.ResourceRecordSets.filter(isCNAME).map(fmt)
          callback(null, existing)
        }
      })
    },

    function maybeCreateCNAME(existing, callback) {
      let changeNeeded = existing.some(exists=> !reduced.find(r=> r.name === exists.name))
      if (changeNeeded) {
        let Changes = reduced.map(option=> {
          return {
            Action: 'UPSERT',
            ResourceRecordSet: {
              TTL:0,
              ResourceRecords: [{
                Value: option.value
              }],
              Name: option.name,
              Type: 'CNAME'
            }
          }
        })
        route53.changeResourceRecordSets({
          ChangeBatch: {
            Comment: `defined by .arc @domain ${domain}`,
            Changes,
          },
          HostedZoneId,
        },
        function done(err) {
          if (err) callback(err)
          else {
            console.log('updated cname')
            callback(Error('cancel'))
          }
        })
      }
      else {
        callback()
      }
    }
  ], callback)
}
