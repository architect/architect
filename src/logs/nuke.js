let aws = require('aws-sdk')
let parallel = require('run-parallel')

module.exports = function nuke(name, callback) {

  let region = process.env.AWS_REGION
  let cloud = new aws.CloudWatchLogs({region})

  let deleteLogs = streams => parallel(streams.map(log => cb => {
    cloud.deleteLogStream({
      logGroupName: name,
      logStreamName: log.logStreamName,
    }, cb)
  }))

  let count = 0

  let run = () => {
    cloud.describeLogStreams({logGroupName: name}, (err, streams) => {
      streams = streams.logStreams
      if (!streams.length) return callback(null, count)
      count += streams.length
      deleteLogs(streams, (err) => {
        if (err) return callback(err)
        else run()
      })
    })
  }
  run()
}
