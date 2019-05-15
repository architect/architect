let path = require('path')
let fs = require('fs')
let getLambdaName = require('../util/get-lambda-name')
let toLogicalID = require('./to-logical-id')
let unexpress = require('../create/aws/create-http-route/create-route/_un-express-route')

module.exports = function getApiProperties(arc) {
  return {
    Name: toLogicalID(arc.app[0]),
    StageName: 'production',
    DefinitionBody: getOpenApi(arc),
    EndpointConfiguration: 'REGIONAL',
    BinaryMediaTypes: ['*/*'],
    MinimumCompressionSize: 0,
  }
}

function getOpenApi(arc) {
  return {
    openapi: '3.0.1',
    info: {
      title: arc.app[0],
    },
    paths: getPaths(arc.http)
  }
}

function getPaths(routes) {
  let dir = path.join(__dirname, '..', 'create', 'aws', 'create-http-route', 'create-route')
  var vtl = fs.readFileSync(path.join(dir, '_request.vtl')).toString()
  var vtlForm = fs.readFileSync(path.join(dir, '_request-form-post.vtl')).toString()
  var vtlBinary = fs.readFileSync(path.join(dir, '_request-binary.vtl')).toString()
  var resVtl = fs.readFileSync(path.join(dir, '_response.vtl')).toString()
  let result = {}
  routes.forEach(route=> {
    let method = route[0]
    let path = unexpress(route[1])
    if (!result[path]) {
      result[path] = {}
    }
    if (!result[path][method]) {
      result[path][method] = {
        'x-amazon-apigateway-integration': {
          uri: getURI({path, method}),//"arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:455488262213:function:futz-w-sam-staging-get-index/invocations",
          responses: {
            default: {
              statusCode: '200', // lol
              contentHandling: 'CONVERT_TO_TEXT',
              responseTemplates: {
                'text/html': resVtl
              }
            }
          },
          passthroughBehavior: 'when_no_match',
          httpMethod: 'POST',
          requestTemplates: {
            'application/json': vtl,
            'application/octet-stream': vtlBinary,
            'application/vnd.api+json': vtl,
            'application/x-www-form-urlencoded': vtlForm,
            'application/xml': vtl,
            'multipart/form-data': vtlBinary,
            'text/css': vtl,
            'text/html': vtl,
            'text/javascript': vtl,
            'text/plain': vtl,
          },
          contentHandling: 'CONVERT_TO_TEXT',
          type: 'aws'
        }
      }
    }
  })
  return addStatic(addFallback(result))
}

function getURI({path, method}) {
  let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`))
  return {
    "Fn::Sub": `arn:aws:apigateway:\${AWS::Region}:lambda:path/2015-03-31/functions/\${${name}.Arn}/invocations`
  }
}

function addStatic(cf) {return cf}
function addFallback(cf) {return cf}
