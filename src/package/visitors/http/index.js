let getLambdaName = require('../../../util/get-lambda-name')
let unexpress = require('../../../create/aws/create-http-route/create-route/_un-express-route')
let toLogicalID = require('../to-logical-id')
let getApiProperties = require('./get-api-properties')
let getPropertyHelper = require('./get-lambda-config')
let getEnv = require('./get-lambda-env')
let getPolicies = require('./get-lambda-policies')

/**
 * visit arc.http and merge in AWS::Serverless resources
 */
module.exports = function http(arc, template) {

  // base props
  let Type = 'AWS::Serverless::Api'
  let Properties = getApiProperties(arc)
  let appname = toLogicalID(arc.app[0])

  // construct the runtime env
  let env = getEnv(arc)

  // ensure cf standard sections exist
  if (!template.Resources)
    template.Resources = {}

  if (!template.Outputs) 
    template.Outputs = {}

  // construct the api resource
  template.Resources[appname] = {Type, Properties}

  // walk the arc file http routes
  arc.http.forEach(route=> {

    let method = route[0] // get, post, put, delete, patch
    let path = unexpress(route[1]) // /foo/{bar}
    let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`)) // GetIndex
    let code = `./src/http/${method}${getLambdaName(route[1])}` // ./src/http/get-index
    let prop = getPropertyHelper(arc, code) // returns a helper function for getting props
    let policies = getPolicies(arc, code)

    // adding lambda resources
    template.Resources[name] = {
      Type: 'AWS::Serverless::Function',
      Properties: {
        Handler: 'index.handler',
        CodeUri: code,
        Runtime: prop('runtime'),
        MemorySize: prop('memory'),
        Timeout: prop('timeout'),
        Environment: {Variables: env},
        Policies: policies,
        Events: {}
      }
    }

    let concurrency = prop('concurrency')
    if (concurrency != 'unthrottled') {
      template.Resources[name].Properties.ReservedConcurrentExecutions = concurrency
    }

    let layers = prop('layers')
    if (Array.isArray(layers) && layers.length > 0) {
      template.Resources[name].Properties.Layers = layers
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
        SourceArn: { 
          'Fn::Sub': [ 
            'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${restApiId}/*/*', 
            {restApiId: {'Ref': appname}} 
          ]
        }
      }
    }
  }

  // add the deployment url to the output
  template.Outputs.ProductionURL = {
    Description: 'Deployment URL',
    Value: { 
      'Fn::Sub': [ 
        'https://${restApiId}.execute-api.${AWS::Region}.amazonaws.com/production/', 
        {restApiId: {'Ref': appname}} 
      ]
    },
    //Export: {Name: 'WebRootUrl'}
  }

  return template
}
