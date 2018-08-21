var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var aws = require('aws-sdk')

/**
 * creates two queues
 *
 * - appname-staging-queue
 * - appname-production-queue
 */
module.exports = function _createSQS(params, callback) {

  assert(params, {
    app: String,
    queue: String
  })

  function createQueue(env, callback) {
    let sqs = new aws.SQS
    sqs.createQueue({
      QueueName: `${params.app}-${env}-${params.queue}`,
    },
    function _createQueue(err) {
      if (err) console.log(err)
      callback()
    })
  }

  // create two topics, one for staging one for prod
  var staging = createQueue.bind({}, 'staging')
  var production = createQueue.bind({}, 'production')

  // lets be quick about it
  parallel([
    staging,
    production
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}
