var assert = require('@smallwins/validate/assert')
var fs = require('fs')
var path = require('path')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var iam = new aws.IAM
var lambda = new aws.Lambda
var gateway = new aws.APIGateway

module.exports = function _02setupRequest(params, callback) {

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
    /*
    function _putIntegrationRequest(arn, callback) {
      var region = (new aws.Config).region || 'us-east-1' // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
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
        }
      }, callback)
    }*/
    function _putIntegrationRequest(arn, callback) {
      gateway.getIntegration({
        httpMethod: httpMethod.toUpperCase(),
        resourceId,
        restApiId,
      },
      function(err, result) {
        if (err && err.name != 'NotFoundException') {
          console.log('getIntegeration failed', err)
          callback(err)
        }
        else if (err && err.name === 'NotFoundException') {
          var region = (new aws.Config).region || 'us-east-1' // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
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
            }
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
      iam.getUser({}, function _getUser(err, result) {
        if (err) {
          callback(err)
        }
        else {
          var accountID = result.User.Arn.split(':')[4] // FIXME feels so brittle..
          callback(null, accountID)
        }
      })
    },
    function _addApiGatewayInvokePermission(accountID, callback) {
      // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
      var region = (new aws.Config).region || 'us-east-1'
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
      console.log(err)
    }
    callback(null, resourceId, restApiId)
  })
}
