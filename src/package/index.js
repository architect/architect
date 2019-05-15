let getApiProperties = require('./get-api-properties')
let getLambdaName = require('../util/get-lambda-name')
let unexpress = require('../create/aws/create-http-route/create-route/_un-express-route')
let toLogicalID = require('./to-logical-id')

module.exports = function getCF(arc) {
  return {
    AWSTemplateFormatVersion: '2010-09-09',
    Transform: 'AWS::Serverless-2016-10-31',
    Description: 'Exported by .arc',
    Resources: getResources(arc)
  }
}

function getResources(arc) {
  let appname = toLogicalID(arc.app[0])
  let result = {}
  if (arc.http) {
    let Type = 'AWS::Serverless::Api'
    let Properties = getApiProperties(arc)
    result[appname] = {Type, Properties}
    arc.http.forEach(route=> {
      let method = route[0]
      let path = unexpress(route[1])
      let name = toLogicalID(getLambdaName(`${method.toLowerCase()}${path}`))
      result[name] = {
        Type: 'AWS::Serverless::Function',
        Properties: {
          Handler: 'index.js',
          Runtime: 'nodejs10.x',
          CodeUri: `./src/http/${route[0]}${getLambdaName(route[1])}`,
          MemorySize: 1024,
          Timeout: 15,
        }
      }
    })
  }
  // if (arc.static)
  // if (arc.tables) 
  // if (arc.indexes) 
  // if (arc.events) 
  // if (arc.queues) 
  // if (arc.scheduled) 
  // if (arc.ws)
  return result
}
