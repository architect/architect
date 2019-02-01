let aws = require('aws-sdk')

/**
 * haha, wow
 */
module.exports = function write({app, env}, {restApiId, arn}, callback) {
  let region = process.env.AWS_REGION
  let api = new aws.APIGateway({region})
  api.putRestApi({
    restApiId,
    failOnWarnings: true,
    mode: 'merge',// overwrite
    body: JSON.stringify({
      openapi: '3.0.0',
      info: {
        version: '2016-09-12T23:19:28Z',
        title: `${app}-${env}`
      },
      paths: {
        '/{proxy+}': {
          'x-amazon-apigateway-any-method': {
            parameters: [{
              name: 'proxy',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            }],
            'x-amazon-apigateway-integration': {
              uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${arn}/invocations`,
              responses: {
                default: {
                  statusCode: '200'
                }
              },
              passthroughBehavior: 'when_no_match',
              httpMethod: 'POST',
              cacheNamespace: 'xlr8r',
              cacheKeyParameters: [
                'method.request.path.proxy'
              ],
              contentHandling: 'CONVERT_TO_TEXT',
              type: 'aws_proxy'
            }
          }
        }
      },
    })
  },
  function done(err) {
    if (err) callback(err)
    else callback(null, {restApiId, arn})
  })
}
