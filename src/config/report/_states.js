let aws = require('aws-sdk')
let series = require('run-series')

module.exports = function states({staging, production, isScheduled}, callback) {
  if (isScheduled) {
    let region = process.env.AWS_REGION
    let cloudwatchevents = new aws.CloudWatchEvents({region})
    series([staging, production].map(FunctionName=> {
      return function getFun(callback) {
        cloudwatchevents.describeRule({
          Name: FunctionName,
        }, callback)
      }
    }), callback)
  }
  else {
    callback()
  }
}
