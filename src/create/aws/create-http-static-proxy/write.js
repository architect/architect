let aws = require('aws-sdk')

/**
 * haha, wow2
 */
module.exports = function write({app, env}, {restApiId, endpoint}, callback) {
  let region = process.env.AWS_REGION
  let api = new aws.APIGateway({region})
  api.putRestApi({
    restApiId,
    failOnWarnings: true,
    mode: 'merge',
    body: JSON.stringify({
      openapi: '3.0.0',
      info: {
        version: '2016-09-12T23:19:28Z',
        title: `${app}-${env}`
      },
      paths: {
        '/_static/{proxy+}': {
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
              uri: `${endpoint}/{proxy}`,
              responses: {
                default: {
                  statusCode: '200'
                }
              },
              requestParameters: {
                'integration.request.path.proxy': 'method.request.path.proxy'
              },
              passthroughBehavior: 'when_no_match',
              httpMethod: 'ANY',
              cacheNamespace: 'xlr8r2',
              cacheKeyParameters: [
                'method.request.path.proxy'
              ],
              type: 'http_proxy'
            }
          }
        },
      },
    })
  },
  function done(err) {
    if (err) callback(err)
    else callback(null, {restApiId, endpoint})
  })
}
