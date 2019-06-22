let fs = require('fs')
let path = require('path')
let toLogicalID = require('../to-logical-id')

module.exports = function getPolicies(arc, pathToCode) {
  let policies = []

  // add permissions to acess tables
  if (arc.tables) {
    arc.tables.forEach(table=> {
      let tbl = Object.keys(table)[0]
      let TableName = toLogicalID(tbl)
      policies.push({DynamoDBCrudPolicy: {TableName}})
    })
  }

  // add permission to read from static bucket
  if (arc.static) {
    policies.push({S3ReadPolicy: {BucketName: {Ref: 'StaticBucket'}}})
  }

  return policies
}
