let getLambdaName = require('../../../util/get-lambda-name')
let unexpress = require('../../../create/aws/create-http-route/create-route/_un-express-route')
let getApiProperties = require('./get-api-properties')
let toLogicalID = require('../to-logical-id')

/**
 * visit arc.http and merge in AWS::Serverless resources
 */
module.exports = function http(arc, template) {

  let Type = 'AWS::Serverless::Api'
  let Properties = getApiProperties(arc)
  let appname = toLogicalID(arc.app[0])

  // ensure cf standard sections exist
  if (!template.Resources)
    template.Resources = {}
  if (!template.Outputs) 
    template.Outputs = {}

  // construct the api resource
  template.Resources[appname] = {Type, Properties}

  // walk the arc file http routes
  arc.http.forEach(route=> {

    let method = route[0]
    let path = unexpress(route[1])
    let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`))

    // adding lambda resources
    template.Resources[name] = {
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
    template.Resources[name].Properties.Events[eventName] = {
      Type: 'Api',
      Properties: {
        Path: path,
        Method: route[0].toUpperCase(),
        RestApiId: {'Ref': appname}
      }
    }
  })

  // add permissions for proxy+ resource aiming at GetIndex
  if (template.Resources.GetIndex) {
    template.Resources.InvokeProxyPermission = {
      Type: 'AWS::Lambda::Permission',
      Properties: {
        FunctionName: {Ref: 'GetIndex'},
        Action: 'lambda:InvokeFunction',
        Principal: 'apigateway.amazonaws.com',
        SourceArn: getSourceArn(appname)
      }
    }
  }

  template.Outputs.ProductionURL = {
    Description: 'Deployment URL',
    //Value: {!Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
    Value: { 
      'Fn::Sub': [ 
        'https://${restApiId}.execute-api.${AWS::Region}.amazonaws.com/production/', 
        {restApiId: {'Ref': appname}} 
      ]
    }
  }




  return template
}

function getSourceArn(appname) {
  return { 
    'Fn::Sub': [ 
      'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${restApiId}/*/*', 
      {restApiId: {'Ref': appname}} 
    ]
  }
}
