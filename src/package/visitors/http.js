let getLambdaName = require('../../util/get-lambda-name')
let unexpress = require('../../create/aws/create-http-route/create-route/_un-express-route')
let getApiProperties = require('../get-api-properties')
let toLogicalID = require('../to-logical-id')

module.exports = function http(arc, result) {

  let Type = 'AWS::Serverless::Api'
  let Properties = getApiProperties(arc)

  let appname = toLogicalID(arc.app[0])
  result[appname] = {Type, Properties}

  // walk the arc file http routes
  arc.http.forEach(route=> {

    let method = route[0]
    let path = unexpress(route[1])
    let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`))

    // adding lambda resources
    result[name] = {
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
    result[name].Properties.Events[eventName] = {
      Type: 'Api',
      Properties: {
        Path: path,
        Method: route[0].toUpperCase(),
        RestApiId: {'Ref': appname}
      }
    }
  })

  return result
}
