let aws = require('aws-sdk')
let print = require('./_print')

module.exports = function snstopics(inventory, callback) {
  let {header, notfound, error, deleted} = print(inventory)
  if (inventory.snstopics.length > 0)
    header(`SNS Topics`)
  let copy = inventory.snstopics.slice(0)
  let founds = []
  let sns = new aws.SNS({region: process.env.AWS_REGION})
  function listTopics(next, done) {
    let params = next? {NextToken:next} : {}
    sns.listTopics(params, function _listTopics(err, result) {
      if (err) {
        notfound(err.message)
        done()
      }
      else {
        var index = 0
        result.Topics.map(t=> t.TopicArn.split(':').reverse().shift()).forEach(t=> {
          if (copy.includes(t)) {
            founds.push(t)
            // found(t, result.Topics[index].TopicArn)
            let TopicArn = result.Topics[index].TopicArn
            sns.deleteTopic({TopicArn}, function _deleteTopic(err) {
              if (err) {
                error(err.message)
              }
              else {
                deleted(t, TopicArn)
              }
            })
          }
          index += 1
        })
        if (result.NextToken) {
          listTopics(result.NextToken, done)
        }
        else {
          done()
        }
      }
    })
  }
  listTopics(false, function finished() {
    copy.forEach(t=> {
      if (!founds.includes(t)) {
        notfound(t)
      }
    })
    callback()
  })
}
