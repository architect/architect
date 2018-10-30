let aws = require('aws-sdk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')

module.exports = function nuke(name, callback) {

  let region = process.env.AWS_REGION
  let cloud = new aws.CloudWatchLogs({region})

  waterfall([
    function describeLogStreams(callback) {
      cloud.describeLogStreams({
        logGroupName: name
      }, callback)
    },
    function getLogEvents(result, callback) {
      parallel(result.logStreams.map(logStream=> {
        return function getOneLogEventStream(callback) {
          cloud.deleteLogStream({
            logGroupName: name,
            logStreamName: logStream.logStreamName,
          }, callback)
        }
      }), callback)
    },
  ],
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
