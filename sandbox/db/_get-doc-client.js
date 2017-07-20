var aws = require('aws-sdk')
AWS.config.update({region: 'us-west-1'})
var endpoint = new aws.Endpoint('http://localhost:5000')
var client = new aws.DynamoDB.DocumentClient({endpoint})

module.exports = client
