let aws = require('aws-sdk')
let parallel = require('run-parallel')

module.exports = function nuke(name, callback) {
  let region = process.env.AWS_REGION
  let cloud = new aws.CloudWatchLogs({region})

  cloud.deleteLogGroup({logGroupName: name}, callback)
}
