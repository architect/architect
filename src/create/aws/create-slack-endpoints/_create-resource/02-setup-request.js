var assert = require('@smallwins/validate/assert')
var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var iam = new aws.IAM
var lambda = new aws.Lambda
var gateway = new aws.APIGateway
var getReqTmpl = require('./_get-request-tmpl')

module.exports = function _02setupRequest(params, callback) {

  assert(params, {
    route: String,
    httpMethod: String,
    deployname: String,
    resourceId: String,
    restApiId: String,
    type: String,
  })

  var {httpMethod, deployname, resourceId, restApiId, type} = params

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
      var region = (new aws.Config).region || 'us-east-1' // – ̗̀ 𝓗𝔞𝔱𝔢𝔯𝔰 𝔤𝔬𝔫𝔫𝔞 𝔥𝔞𝔱𝔢 ̖́- ᕕ( ᐛ )ᕗ✧ platform voodoo
      var uri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${arn}/invocations`
      gateway.putIntegration({
        httpMethod: httpMethod.toUpperCase(),
        resourceId,
        restApiId,
        type: 'AWS',
        integrationHttpMethod: 'POST',
        uri,
        requestTemplates: getReqTmpl(type)
      }, callback)
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
