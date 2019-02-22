var aws = require('aws-sdk')
let parallel = require('run-parallel')
let waterfall = require('run-waterfall')

module.exports = function logs(name, callback) {

  let region = process.env.AWS_REGION
  let cloud = new aws.CloudWatchLogs({region})

  waterfall([

    function describeLogStreams(callback) {
      cloud.describeLogStreams({
        logGroupName: name,
        descending: true,
        orderBy: 'LastEventTime'
      }, callback)
    },

    function getLogEvents(result, callback) {
      var names = result.logStreams.map(l=> l.logStreamName).reverse()
      parallel(names.map(logStreamName=> {
        return function getOneLogEventStream(callback) {
          cloud.getLogEvents({
            logGroupName: name,
            logStreamName,
          }, callback)
        }
      }), callback)
    },

    function cleanup(results, callback) {
      if (results.length === 0) {
        callback(null, results)
      }
      else {
        let events = results.map(r=>r.events).reduce((a, b)=> a.concat(b))
        callback(null, events)
      }
    }
  ], callback)
}

