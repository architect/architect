var aws = require('aws-sdk')
var waterfall = require('run-waterfall')
var parallel = require('run-parallel')
var route53 = new aws.Route53
var gw = new aws.APIGateway


module.exports = function createDomain(app, domain, callback) {
  // get the hosted zone for the domain
  // list the record sets for the hosted zone O
  // if the staging alias doesn't exist create it
  // if the pro alias doesn't exist create it
  route53.listHostedZones({}, function(err, data) {
    if (err) throw err
    var zone = data.HostedZones.find(i=>i.Name === `${domain}.`)

    console.log({zone})

    route53.listResourceRecordSets({
      HostedZoneId:  zone.Id,
      StartRecordName: 'A',
      StartRecordType: 'A'
    }, 
    function(err, result) {
      if (err) throw err
      var hasA = result.ResourceRecordSets.find(r=> r.Type === 'A')
        console.log('HHHHHHH',result)
      if (hasA) {
        console.log('alias found')
        callback()
      }
      else {
        console.log('create alias')
        // lookup cloudfront dist name
        gw.getDomainNames({
          limit: 500,
        }, 
        function _list(err, data) {
          if (err) throw err
          // look for domain.com and staging.domain.com
          var staging = data.items.find(r=> r.domainName === `staging.${domain}`)
          var production = data.items.find(r=> r.domainName === domain)
          console.log({staging, production})
          callback()
        })
        
          /*
        route53.changeResourceRecordSets({
          ChangeBatch: {
             Changes: [{
               Action: "CREATE", 
               ResourceRecordSet: {
                 AliasTarget: {
                   DNSName: "d123rk29d0stfj.cloudfront.net", 
                   EvaluateTargetHealth: false, 
                   HostedZoneId: "Z2FDTNDATAQYW2"
                 }, 
                 Name: "example.com", 
                 Type: "A"
               }
             }], 
             Comment: "CloudFront distribution for example.com"
          }, 
          HostedZoneId: "Z3M3LMPEXAMPLE"// Depends on the type of resource that you want to route traffic to
        }, 
        function _create(err, data) {
          if (err) throw err
          callback()
        })*/

      }
    })
  })
}
