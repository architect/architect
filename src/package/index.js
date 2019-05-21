let version = require('../version')
let visitors = require('./visitors')

/**
 * returns AWS::Serverless JSON for a given (parsed) .arc file
 */
module.exports = function toServerlessCloudFormation(arc) {

  let supports = [
    'http',
    'static',
    'tables',
    //queues
    //events
    //scheduled
    //ws
    //indexes
  ]

  let supported = pragma=> supports.includes(pragma)
  let httpFirst = (x, y)=> x == 'http'? -1 : y == 'http'? 1 : 0
  let pragmas = Object.keys(arc).filter(supported).sort(httpFirst)
  let visit = (template, pragma)=> visitors[pragma](arc, template)

  // default cloudformation template
  // visitors will interpolate: Parameters, Mappings, Conditions, Resources, and Outputs
  let template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Transform: 'AWS::Serverless-2016-10-31',
    Description: `Exported by .arc ${version} on ${new Date(Date.now()).toISOString()}`,
  }

  // walk pragmas to reduce final template contents
  return pragmas.reduce(visit, template)
}
