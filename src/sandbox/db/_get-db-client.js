var AWS = require('aws-sdk')
var endpoint = new AWS.Endpoint('http://localhost:5000')
var dynamo = new AWS.DynamoDB({endpoint})

module.exports = dynamo
