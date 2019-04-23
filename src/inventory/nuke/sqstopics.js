let aws = require('aws-sdk')
let print = require('./_print')
let series = require('run-series')

module.exports = function sqstopics(inventory, callback) {

  let {header, notfound, error, /*deleted*/} = print(inventory)

  if (inventory.sqstopics.length > 0)
    header(`SQS Topics`)

  let copy = inventory.sqstopics.slice(0)
  //let founds = []

  let sqs = new aws.SQS({region: process.env.AWS_REGION})
  sqs.listQueues({
    QueueNamePrefix: inventory.app
  },
  function listQueues(err, result) {
    if (err) {
      error(err.message)
      callback()
    }
    else if (result && result.QueueUrls) {
      series(result.QueueUrls.map(QueueUrl=> {
        return function deleteQueue(callback) {
          sqs.deleteQueue({
            QueueUrl
          },
          function deleted(err) {
            if (err) error(err.message)
            else {
              deleted(QueueUrl)
            }
            callback()
          })
        }
      }),
      function done(err) {
        if (err)
          error(err.message)
        callback()
      })
    }
    else {
      copy.forEach(notfound)
    }
  })
}
