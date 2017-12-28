var assert = require('@smallwins/validate/assert')
var aws = require('aws-sdk')
var gateway = new aws.APIGateway

/**
 * returns the current deploy url
 */
module.exports = function _getUrl(params, callback) {
  assert(params, {
    env: String,
    arc: Object,
  })
  if (params.arc.domain) {
    var domain = params.arc.domain
    var staging = params.env === 'staging'
    var url = staging? `https://staging.${domain}` : `https://${domain}`
    callback(null, url)
  }
  else {
    gateway.getRestApis({
      limit: 500,
    },
    function _getRestApis(err, result) {
      if (err) {
        callback(err)
      }
      else {
        var restApiId = result.items.find(i=> i.name === `${params.arc.app[0]}-${params.env}`).id
        var url = `https://${restApiId}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${params.env}`
        callback(null, url)
      }
    })
  }
}
