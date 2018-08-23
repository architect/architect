let aws = require('aws-sdk')

module.exports = function snstopics(name, callback) {

  let sns = new aws.SNS({region: process.env.AWS_REGION})
  let found = false

  // aws-sdk isn't the friendliest api
  // we need to recurse thru topics searching for the arn
  function listTopics(next, done) {
    let params = next? {NextToken:next} : {}
    sns.listTopics(params, function _listTopics(err, result) {
      if (err) {
        done(err)
      }
      else {
        // keep track of our current iteration
        let index = 0
        let tidy = t=> t.TopicArn.split(':').reverse().shift()
        // iterate the topics seeking our name
        result.Topics.map(tidy).forEach(t=> {
          if (t === name) {
            found = result.Topics[index].TopicArn
          }
          index += 1
        })
        // if there are more pages walk those
        let more = result.NextToken && !found
        if (more) {
          listTopics(result.NextToken, done)
        }
        else {
          // otherwise we're done walking
          done()
        }
      }
    })
  }
  // 👢s, start walking
  listTopics(false, function finished(err) {
    callback(err, found)
  })
}
