var AWS = require('aws-sdk')
var endpoint = new AWS.Endpoint('http://localhost:5000')
var client = new AWS.DynamoDB.DocumentClient({endpoint})

module.exports = client
