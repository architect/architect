let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

module.exports = function route({api, env, name, region, account, RouteKey}, callback) {

  let gateway = new aws.ApiGatewayV2({region})
  let lambda = new aws.Lambda({region})

  let arn = `arn:aws:lambda:${region}:${account}:function:${name}-${env}-ws-${RouteKey.replace('$', '')}`

  // used later
  let integrationId
  waterfall([

    /**
     * setup the integration
     */
    function createIntegration(callback) {
      setTimeout(function throttle() {
        let uri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${arn}/invocations`
        gateway.createIntegration({
          ApiId: api.ApiId,
          IntegrationMethod: 'POST',
          IntegrationType: 'AWS_PROXY',
          IntegrationUri: uri
        }, callback)
      }, 1000)
    },

    /**
     * add the invoke permission
     */
    function addPermission(result, callback) {
      setTimeout(function throttle() {
        integrationId = result.IntegrationId
        lambda.addPermission({
          FunctionName: arn,
          Action: 'lambda:InvokeFunction',
          Principal: "apigateway.amazonaws.com",
          StatementId: "arc-idx-" + Date.now(),
          SourceArn: `arn:aws:execute-api:${region}:${account}:${api.ApiId}/*/*`,
        }, callback)
      }, 1000)
    },

    /**
     * create the route
     */
    function createRoute(result, callback) {
      setTimeout(function throttle() {
        gateway.createRoute({
          ApiId: api.ApiId,
          RouteKey,
          Target: `integrations/${integrationId}`
        }, callback)
      }, 1000)
    }
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
