var assert = require('@smallwins/validate/assert')
var fs = require('fs')
var path = require('path')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')

module.exports = function _02setupRequest(params, callback) {

  var sts = new aws.STS
  var lambda = new aws.Lambda({region: process.env.AWS_REGION})
  var gateway = new aws.APIGateway({region: process.env.AWS_REGION})

  assert(params, {
    route: String,
    httpMethod: String,
    deployname: String,
    resourceId: String,
    restApiId: String,
  })

  var {httpMethod, deployname, resourceId, restApiId} = params
  var vtl = fs.readFileSync(path.join(__dirname, '_request.vtl')).toString()
  var vtlForm = fs.readFileSync(path.join(__dirname, '_request-form-post.vtl')).toString()
  waterfall([
    function _getLambda(callback) {
      lambda.getFunction({
        FunctionName: deployname
      },
      function _gotFn(err, data) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, data.Configuration.FunctionArn)
        }
      })
    },
    function _putIntegrationRequest(arn, callback) {
      gateway.getIntegration({
        httpMethod: httpMethod.toUpperCase(),
        resourceId,
        restApiId,
      },
      function(err, result) {
        if (err && err.name != 'NotFoundException') {
          callback(err)
        }
        else if (err && err.name === 'NotFoundException') {
          var region = process.env.AWS_REGION //(new aws.Config).region || 'us-east-1' // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
          var uri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${arn}/invocations`
          gateway.putIntegration({
            httpMethod: httpMethod.toUpperCase(),
            resourceId,
            restApiId,
            type: 'AWS',
            integrationHttpMethod: 'POST',
            uri,
            requestTemplates: {
              'text/html': vtl,
              'application/x-www-form-urlencoded': vtlForm,
              'multipart/form-data': vtl,
              'application/json': vtl,
              'application/vnd.api+json': vtl,
              'application/xml': vtl,
              'text/css': vtl,
              'text/javascript': vtl,
              'text/plain': vtl,
            },
            passthroughBehavior: 'WHEN_NO_MATCH',
            contentHandling: 'CONVERT_TO_TEXT',
          },
          function(err,result) {
            if (err) {
              console.log('putIntegration failed', err.name, {restApiId, resourceId})
              callback(err)
            }
            else {
              callback(null, result)
            }
          })
        }
        else {
          callback(null, result)
        }
      })
    },
    function _getAccountID(noop, callback) {
      sts.getCallerIdentity({}, function _getIdx(err, result) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, result.Account)
        }
      })
    },
    function _addApiGatewayInvokePermission(accountID, callback) {
      // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
      var region = process.env.AWS_REGION //(new aws.Config).region || 'us-east-1'
      var mthd = httpMethod.toUpperCase()
      var path = params.route.split(/:[a-z]+/i).join('*').replace('/', '')
      var SourceArn = `arn:aws:execute-api:${region}:${accountID}:${restApiId}/*/${mthd}/${path}`
      lambda.addPermission({
        FunctionName: deployname,
        Action: "lambda:InvokeFunction",
        Principal: "apigateway.amazonaws.com",
        StatementId: "arc-idx-" + Date.now(),
        SourceArn,
      }, callback)
    },
  ],
  function _addPermission(err) {
    if (err) {
      callback(err)
    }
    else {
      callback(null, resourceId, restApiId)
    }
  })
}
