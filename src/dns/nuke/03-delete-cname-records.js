let aws = require('aws-sdk')
let print = require('./_print')
let waterfall = require('run-waterfall')
let parallel = require('run-parallel')
let _reduceResourceRecords = require('../route53/_cert-reduce-resource-records')

module.exports = function ({domain, route53}, callback) {
  if (route53) {
    waterfall([
      function reads(callback) {
        parallel({
          cert(callback) {
            _getCert({
              domain,
            }, callback)
          },
          zones(callback) {
            _getCNAME({
              domain,
            }, callback)
          },
        }, callback)
      },
      function writes(result, callback) {
        let HostedZoneId = result.zones.HostedZoneId
        let Changes = []
        result.cert.forEach(record=> {
          let exists = result.zones.records.find(r=> r.Name === record.name)
          if (exists) {
            Changes.push({
              Action: 'DELETE',
              ResourceRecordSet: exists,
            })
          }
        })
        if (Changes.length > 0) {
          let route53 = new aws.Route53
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
      },
    ],
    function done(err) {
      if (err && err.message != 'not_found')
        print(err)
      callback()
    })
  }
  else {
    callback() //not deleting the cname
  }
}

function _getCNAME({domain}, callback) {
  let route53 = new aws.Route53
  waterfall([
    function getHostedZone(callback) {
      route53.listHostedZonesByName({
        DNSName: domain,
        MaxItems: '1',
      }, callback)
    },
    function getRecordSets(result, callback) {
      let exists = result.HostedZones && result.HostedZones.length > 0
      if (exists) {
        let HostedZoneId = result.HostedZones[0].Id
        route53.listResourceRecordSets({
          HostedZoneId,
        },
        function done(err, result) {
          if (err) callback(err)
          else {
            let filter = r=> r.Type === 'CNAME'
            let records = result.ResourceRecordSets.filter(filter)
            if (records.length > 0) {
              callback(null, {records, HostedZoneId})
            }
            else {
              // no CNAME to delete
              callback(Error('not_found'))
            }
          }
        })
      }
      else {
        // no hosted then no CNAME to delete
        callback(Error('not_found'))
      }
    },
  ], callback)
}

function _getCert({domain}, callback) {
  let acm = new aws.ACM({region: 'us-east-1'})
  waterfall([
    function listCerts(callback) {
      acm.listCertificates({}, callback)
    },
    function getCert(result, callback) {
      let cert = result.CertificateSummaryList? result.CertificateSummaryList.find(c=> c.DomainName === domain) : false
      if (cert) {
        acm.describeCertificate({
          CertificateArn: cert.CertificateArn
        },
        function done(err, result) {
          if (err) callback(err)
          else {
            callback(null, _reduceResourceRecords(result))
          }
        })
      }
      else {
        // no CERT then no CNAME to delete
        callback(Error('not_found'))
      }
    },
  ], callback)
}
