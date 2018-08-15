let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

// creates a custom domain name and base path mapping for it in api gateway
module.exports = function _create({domainName, certificateArn, restApiId, stage}, callback) {
  setTimeout(function delay() {
    var gw = new aws.APIGateway({region: process.env.AWS_REGION})
    waterfall([
      function createDomainName(callback) {
        gw.createDomainName({
          domainName,
          certificateArn,
        }, callback)
      },
      function createBasePathMapping(result, callback) {
        gw.createBasePathMapping({
          domainName,
          restApiId,
          stage,
        }, callback)
      }
    ], callback)
  }, _getTimeout())
}

// stagger to avoid throttle
let _firstRun = true
function _getTimeout() {
  if (_firstRun) {
    _firstRun = false
    return 0
  }
  else {
    return 35*1000
  }
}


