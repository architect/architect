let aws = require('aws-sdk')
let waterfall = require('run-waterfall')
let series = require('run-series')

module.exports = function map(FunctionName, callback) {
  waterfall([
    function reads(callback) {
      let sts = new aws.STS
      sts.getCallerIdentity({}, callback)
    },
    function writes(result, callback) {
      let REGION = process.env.AWS_REGION
      let ACCOUNT = result.Account
      let EventSourceArn = `arn:aws:sqs:${REGION}:${ACCOUNT}:${FunctionName}`
      let lambda = new aws.Lambda({region: process.env.AWS_REGION})
      lambda.createEventSourceMapping({
        EventSourceArn,
        FunctionName,
        BatchSize: 1,
      },
      function done(err) {
        if (err && err.code === 'ResourceConflictException') {
          // del + retry
          lambda.listEventSourceMappings({
            FunctionName,
            EventSourceArn,
          },
          function done(err, result) {
            if (err) callback(err)
            else {
              // delete mappings and retry
              series(result.EventSourceMappings.map(esm=> {
                return function nukeMapping(callback) {
                  lambda.deleteEventSourceMapping({
                    UUID: esm.UUID,
                  }, callback)
                }
              }),
              function done(err) {
                if (err) callback(err)
                else {
                  lambda.createEventSourceMapping({
                    EventSourceArn,
                    FunctionName,
                    BatchSize: 1,
                  }, callback)
                }
              })
            }
          })
        }
        else if (err) {
          callback(err)
        }
        else {
          callback()
        }
      })
    }
  ], callback)
}
