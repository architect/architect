let toLogicalID = require('./to-logical-id')
let getApiProperties = require('./get-api-properties')
let getLambdaName = require('../util/get-lambda-name')

let http = require('./visitors/http')
let statics = require('./visitors/static')
let tables = require('./visitors/tables')

module.exports = function getCF(arc) {
  return {
    AWSTemplateFormatVersion: '2010-09-09',
    Transform: 'AWS::Serverless-2016-10-31',
    Description: 'Exported by .arc',
    Resources: getResources(arc),
  }
}

function getResources(arc) {

  let appname = toLogicalID(arc.app[0])
  let result = {}

  /*
   * TODO reduce visitors
  let resources = Object.keys(arc).reduce((resources, pragma)=> {
    return vistors[pragma](arc, resources)
  })*/

  if (arc.http)
    result = http(arc, result)

  if (arc.static)
    result = statics(arc, result) 

  if (arc.tables) 
    result = tables(arc, result) 
  
  // TODO sns if (arc.events) {} 
  // TODO sqs if (arc.queues) {}
  // TODO cwe if (arc.scheduled) {} 
  // TODO apig2 if (arc.ws) {}
  return result
}

