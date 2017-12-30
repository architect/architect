var AWS = require('aws-sdk')
AWS.config.update({region: 'us-west-1'})
var endpoint = new AWS.Endpoint('http://localhost:5000')
var dynamo = new AWS.DynamoDB({endpoint})

module.exports = dynamo
