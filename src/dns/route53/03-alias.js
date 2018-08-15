let aws = require('aws-sdk')
let chalk = require('chalk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')

/**
 * display A records if they exist
 * create and display if they do not
 */
module.exports = function _alias(domain, callback) {
  let route53 = new aws.Route53
  let gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  let HostedZoneId
  waterfall([

    // get the hosted zone
    function getHostedZoneId(callback) {
      route53.listHostedZones({}, callback)
    },

    // read route53 recordsets and apigateway domains
    function getRecordSetsAndDomains(result, callback) {
      HostedZoneId = result.HostedZones.find(i=>i.Name === `${domain}.`).Id
      parallel({
        apis(callback) {
          gateway.getDomainNames({
            limit: 500,
          }, callback)
        },
        records(callback) {
          route53.listResourceRecordSets({
            HostedZoneId,
          }, callback)
        }
      }, callback)
    },

    // looks at apis and records and determines if A records need to be created
    function maybeCreateAliasRecords(result, callback) {

      let records = result.records.ResourceRecordSets.filter(r=> r.Type === 'A').map(r=> r.Name)
      let stagingExists = records.includes(`staging.${domain}.`)
      let productionExists = records.includes(`${domain}.`)
      let skip = stagingExists && productionExists
      if (skip) {
        let records = result.records.ResourceRecordSets.filter(r=> r.Type === 'A')
        let staging = records.find(r=> r.Name === `staging.${domain}.`)
        let production = records.find(r=> r.Name === `${domain}.`)
        console.log(chalk.green.dim('✔ A Records'))
        console.log(chalk.grey(`          Production ${chalk.green.bold.underline(production.Name)}`))
        console.log(chalk.grey(`             Staging ${chalk.green.bold.underline(staging.Name)}`))
        callback()
      }
      else {

        let staging = result.apis.items.find(api=> api.domainName === `staging.${domain}`)
        let production = result.apis.items.find(api=> api.domainName === domain)
        route53.changeResourceRecordSets({
          ChangeBatch: {
            Changes: [{
              Action: 'UPSERT',
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: production.distributionDomainName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: 'Z2FDTNDATAQYW2', /* ah, yes of course */
                },
                Name: domain,
                Type: "A"
              }
            },
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: staging.distributionDomainName,
                  EvaluateTargetHealth: false,
                  HostedZoneId: 'Z2FDTNDATAQYW2', /* ah, yes of course */
                },
                Name: `staging.${domain}`,
                Type: "A"
              }

            }],
            Comment: "defined by .arc @domain " + domain
          },
          HostedZoneId
        },
        function done(err) {
          if (err) callback(err)
          else {
            console.log(chalk.green.dim('✔ Created A Records'))
            callback()
          }
        })
      }
    }

  ], callback)
}
