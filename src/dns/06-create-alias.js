var aws = require('aws-sdk')
var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var route53 = new aws.Route53
var gw = new aws.APIGateway

function _createAlias(params, callback) {
  assert(params, {
    domain: String,
    cloudfrontDomain: String,
    zoneID: String,
  })
  route53.changeResourceRecordSets({
    ChangeBatch: {
       Changes: [{
         Action: 'UPSERT',
         ResourceRecordSet: {
           AliasTarget: {
             DNSName: params.cloudfrontDomain,
             EvaluateTargetHealth: false,
             HostedZoneId: 'Z2FDTNDATAQYW2', /* ah, yes of course */
           },
           Name: params.domain,
           Type: "A"
         }
       }],
       Comment: "defined by .arc @domain " + params.domain
    },
    HostedZoneId: params.zoneID
  },
  function _create(err) {
    if (err) throw err
    callback()
  })
}

module.exports = function createDomain(app, domain, callback) {
  // get the hosted zone for the domain
  // list the record sets for the hosted zone O
  // if the staging alias doesn't exist create it
  // if the pro alias doesn't exist create it
  route53.listHostedZones({}, function(err, data) {
    if (err) throw err
    var zone = data.HostedZones.find(i=>i.Name === `${domain}.`)
    route53.listResourceRecordSets({
      HostedZoneId:  zone.Id,
      StartRecordName: 'A',
      StartRecordType: 'A', // yes, both of these are required!
    },
    function(err) {
      if (err) throw err
      //var stagingAlias = result.ResourceRecordSets.find(r=> r.Type === 'A' && r.Name === `staging.${domain}.`)
      //var productionAlias = result.ResourceRecordSets.find(r=> r.Type === 'A' && r.Name === `${domain}.`)

      var skip = false //!!(stagingAlias && productionAlias)
      if (skip) {
        // console.log('aliases found')
        callback()
      }
      else {
        // lookup cloudfront dist name
        gw.getDomainNames({
          limit: 500,
        },
        function _list(err, data) {
          if (err) throw err

          var stagingDomain = `staging.${domain}`
          var productionDomain = domain
          var staging = data.items.find(r=> r.domainName === stagingDomain)
          var production = data.items.find(r=> r.domainName === productionDomain)

          var stageAlias = _createAlias.bind({}, {
            domain: 'staging.' + domain,
            cloudfrontDomain: staging.distributionDomainName,
            zoneID: zone.Id.replace('/hostedzone/', '')
          })

          var productionAlias = _createAlias.bind({}, {
            domain,
            cloudfrontDomain: production.distributionDomainName,
            zoneID: zone.Id.replace('/hostedzone/', '')
          })

          parallel([
            stageAlias,
            productionAlias
          ],
          function _done(err) {
            if (err) {
              console.log(err)
            }
            callback()
          })
        })
      }
    })
  })
}
