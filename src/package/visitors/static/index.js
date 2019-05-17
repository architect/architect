let toLogicalID = require('../to-logical-id')

/**
 * visit arc.static and merge in AWS::Serverless resources
 */
module.exports = function statics(arc, resources) {

  // idk if this is what we want to do…
  // but we need the bucketname and it needs be lowcase
  let BucketName = `${arc.app[0]}-static-bucket`
  resources.StaticBucket = {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName,
      AccessControl: 'PublicRead',
      WebsiteConfiguration: {
        IndexDocument: 'index.html',
        ErrorDocument: '404.html'
      }
    }
  }

  // if an api is defined then add _static
  if (arc.http)
    resources = addStatic(arc, resources)
  
  return resources
}

function addStatic(arc, resources) {

  let region = process.env.AWS_REGION
  let bucket = `${arc.app[0]}-static-bucket`
  let endpoint = `https://s3-${region}.amazonaws.com/${bucket}`
  let appname = toLogicalID(arc.app[0])

  resources[appname].Properties.DefinitionBody.paths['/_static/{proxy+}'] = {
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
  }
  return resources
}
