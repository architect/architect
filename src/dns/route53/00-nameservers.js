let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let parallel = require('run-parallel')
let _print = require('./_zone-describe')
let _create = require('./_zone-create')

/**
 * display a hosted zone if it exists
 * otherwise create one and display it
 */
module.exports = function createHostedZone(domain, callback) {
  waterfall([
    function listZonesAndCheckRegistrar(callback) {
      parallel({
        zones(callback) {
          let route53 = new aws.Route53
          route53.listHostedZonesByName({
            DNSName: domain,
            MaxItems: '1',
          }, callback)
        },
        registrar(callback) {
          let route53domains = new aws.Route53Domains
          route53domains.getDomainDetail({
            DomainName: domain,
          },
          function done(err, result) {
            if (err) callback(null, false)
            else callback(null, result)
          })
        }
      }, callback)
    },
    function maybePrint({zones, registrar}, callback) {
      var hasOne = zones.HostedZones.length === 1
      var isSame = zones.HostedZones && zones.HostedZones.length === 1 && zones.HostedZones[0].Name === `${domain}.`
      var skip = hasOne && isSame
      if (skip) {
        let HostedZoneId = zones.HostedZones[0].Id
        _print({
          domain,
          registrar,
          HostedZoneId,
        }, callback)
      }
      else {
        _create({
          domain,
          //registrar,
        }, callback)
      }
    }
  ], callback)
}
