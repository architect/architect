var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
let fs = require('fs')
let path = require('path')

module.exports = function _03setupResponse(params, callback) {
  assert(params, {
    httpMethod: String,
    resourceId: String,
    restApiId: String,
    type: String,
  })
  exec(params, callback)
}

function exec(params, callback) {
  var {httpMethod, resourceId, restApiId} = params
  var gateway = new aws.APIGateway({region: process.env.AWS_REGION})
  let statusCode = '200'
  var vtl = fs.readFileSync(path.join(__dirname, '_response.vtl')).toString()
  waterfall([
    function putMethodResponse(callback) {
      gateway.putMethodResponse({
        httpMethod: httpMethod.toUpperCase(),
        resourceId,
        restApiId,
        statusCode,
      },
      function _putMethodResponse(err) {
        // if the method already exists bail quietly
        if (err && err.name != 'ConflictException') {
          callback(err)
        }
        else {
          callback()
        }
      })
    },
    function putIntegrationResponse(callback) {
      gateway.putIntegrationResponse({
        httpMethod: httpMethod.toUpperCase(),
        resourceId,
        restApiId,
        statusCode,
        responseTemplates: {
          'text/html': vtl
        },
        contentHandling: 'CONVERT_TO_TEXT',
      },
      function _putIntegrationResponse(err) {
        // if the method already exists bail quietly
        if (err && err.name != 'ConflictException') {
          callback(err)
        }
        else {
          callback()
        }
      })
    }
  ], callback)
}
