var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')

var getPattern = require('./_get-pattern')
var getResponseParams = require('./_get-response-params')
var getResponseTmpl = require('./_get-response-tmpl')

var gateway = new aws.APIGateway

module.exports = function _03setupResponse(params, callback) {

  assert(params, {
    httpMethod: String,
    resourceId: String,
    restApiId: String,
    type: String,
  })

  var {httpMethod, resourceId, restApiId} = params

  // possibly a bit clever but statusCode needs to be a string so..
  var statusCodes = '200 302 403 404 500'.split(' ').map(statusCode=> {
    return function _saveResponseBs(callback) {
      waterfall([
        function _saveMthd(callback) {
          gateway.putMethodResponse({
            httpMethod: httpMethod.toUpperCase(),
            resourceId,
            restApiId,
            statusCode,
            responseParameters: {
              'method.response.header.Content-Type': false,
              'method.response.header.Set-Cookie': false,
              'method.response.header.Location': false,
            },
          },
          function _putMethod(err) {
            // if the method already exists bail quietly
            if (err && err.name != 'ConflictException') {
              callback(err)
            }
            else {
              callback()
            }
          })
        },
        function _saveIngResp(callback) {
          gateway.putIntegrationResponse({
            httpMethod: httpMethod.toUpperCase(),
            resourceId,
            restApiId,
            statusCode,
            selectionPattern: getPattern(statusCode),
            responseParameters: getResponseParams(params.type),
            responseTemplates: getResponseTmpl(statusCode, params.type)
          },
          function _putResp(err) {
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
  })
  waterfall(statusCodes, callback)
}
