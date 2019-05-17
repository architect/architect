let getLambdaName = require('../../../util/get-lambda-name')
let unexpress = require('../../../create/aws/create-http-route/create-route/_un-express-route')
let getApiProperties = require('./get-api-properties')
let toLogicalID = require('../to-logical-id')

/**
 * visit arc.http and merge in AWS::Serverless resources
 */
module.exports = function http(arc, resources) {

  let Type = 'AWS::Serverless::Api'
  let Properties = getApiProperties(arc)

  let appname = toLogicalID(arc.app[0])
  resources[appname] = {Type, Properties}

  // walk the arc file http routes
  arc.http.forEach(route=> {

    let method = route[0]
    let path = unexpress(route[1])
    let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`))

    // adding lambda resources
    resources[name] = {
      Type: 'AWS::Serverless::Function',
      Properties: {
        Handler: 'index.handler',
        Runtime: 'nodejs10.x',
        CodeUri: `./src/http/${route[0]}${getLambdaName(route[1])}`,
        MemorySize: 1024,
        Timeout: 15,
        Events: {}
      }
    }

    // construct the event source so SAM can wire the permissions
    let eventName = `${name}Event`
    resources[name].Properties.Events[eventName] = {
      Type: 'Api',
      Properties: {
        Path: path,
        Method: route[0].toUpperCase(),
        RestApiId: {'Ref': appname}
      }
    }
  })

  // add permissions for proxy+ resource aiming at GetIndex
  if (resources.GetIndex) {
    resources.InvokeProxyPermission = {
      Type: 'AWS::Lambda::Permission',
      Properties: {
        FunctionName: {Ref: 'GetIndex'},
        Action: 'lambda:InvokeFunction',
        Principal: 'apigateway.amazonaws.com',
        SourceArn: getSourceArn(appname)
      }
    }
  }

  return resources
}

function getSourceArn(appname) {
  return { 
    'Fn::Sub': [ 
      'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${restApiId}/*/*', 
      {restApiId: {'Ref': appname}} 
    ]
  }
}
