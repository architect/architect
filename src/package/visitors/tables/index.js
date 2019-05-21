let clean = require('./clean')
let getTTL = require('./get-ttl')
let toLogicalID = require('../to-logical-id')
let getKeySchema = require('./get-key-schema')
let getAttributeDefinitions = require('./get-attribute-definitions') 

/**
 * visit arc.tables and merge in AWS::Serverless resources
 */
module.exports = function tables(arc, template) {
  if (!template.Resources)
    template.Resources = {}

  arc.tables.forEach(table=> {

    let tbl = Object.keys(table)[0]
    let attr = table[tbl]
    let keys = Object.keys(clean(attr))

    let KeySchema = getKeySchema(attr, keys)
    let hasTTL = getTTL(attr)
    let TableName = toLogicalID(tbl)
    let AttributeDefinitions = getAttributeDefinitions(clean(attr))

    template.Resources[`${TableName}Table`] = {
      Type: 'AWS::DynamoDB::Table',
      //DeletionPolicy: 'Retain',
      Properties: {
        KeySchema,
        //TableName: tbl,
        AttributeDefinitions,
        BillingMode: 'PAY_PER_REQUEST',
        //GlobalSecondaryIndexes: [ GlobalSecondaryIndex, ... ],
        //StreamSpecification: StreamSpecification,
      }
    }

    if (hasTTL) {
      template.Resources[`${TableName}Table`].Properties.TimeToLiveSpecification = {
        AttributeName : hasTTL,
        Enabled: true
      }
    }

    // TODO if stream defined
    // TODO if indexes defined
  })
  return template
}
