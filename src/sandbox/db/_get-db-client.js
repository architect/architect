var AWS = require('aws-sdk')
var endpoint = new AWS.Endpoint('http://localhost:5000')
let region= 'us-west-2'
var dynamo = new AWS.DynamoDB({endpoint, region})

module.exports = dynamo
