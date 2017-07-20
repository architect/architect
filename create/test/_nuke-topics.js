var parallel = require('run-parallel')
var aws = require('aws-sdk')
var sns = new aws.SNS

module.exports = function _nukeTopics(topics, callback) {
  sns.listTopics({}, function _list(err, result) {
    if (err) {
      callback(err)
    }
    else {
      function getArn(event) {
        var found = result.Topics.find(t=> {
          var bits = t.TopicArn.split(':')
          var last = bits[bits.length - 1]
          return last === event
        })
        return found.TopicArn
      }
      var fns = topics.map(t=> {
        return function _del(callback) {
          var TopicArn = getArn(t)
          sns.deleteTopic({TopicArn}, callback)
        }
      })
      parallel(fns, callback)
    }
  })
}
