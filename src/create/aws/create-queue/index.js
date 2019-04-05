var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var aws = require('aws-sdk')

/**
 * creates two queues
 * optional: creates associated deadletter queue when maxReceiveCount is specified
 *
 * - appname-staging-queue
 * - appname-production-queue
 *
 */

module.exports = function _createSQS(params, callback) {

  assert(params, {
    app: String,
    queue: typeof params.queue === 'object' ? Object : String,
  })

  var name = params.queue
  var attrs = {}
  var sqs = new aws.SQS({ region: process.env.AWS_REGION })

  if (typeof params.queue === 'object') {
    name = Object.keys(params.queue)[0] // myqueuename
    attrs = params.queue[name] // { maxReceiveCount: 10 }
  }

  function createDeadLetterQueue(env, callback, queueName) {
    sqs.createQueue({ QueueName: `${queueName}-deadletter` },
      function _createQueue(err, data) {
        if (err) {
          console.log(err)
          callback();
        } else {
          var params = {
            QueueUrl: data.queueUrl,
            AttributeNames: ['QueueArn']
          }
          sqs.getQueueAttributes(params, function _getQueueAttributes(err, data) {
            if (err) {
              console.log(err);
              callback();
            }
            callback(data.Attributes.QueueArn);
          });
        }
      })
  }

  function createPrimaryQueue(env, callback, queueName, config = {}) {
    sqs.createQueue({ QueueName: queueName, ...config },
      function _createQueue(err) {
        if (err) console.log(err)
        callback()
      })
  }

  function createQueue(env, callback) {
    var queueName = `${params.app}-${env}-${name}`
    var config = {}
    if (attrs.maxReceiveCount) {
      config.Attributes = { RedrivePolicy: { maxReceiveCount: attrs.maxReceiveCount } }
      createDeadLetterQueue(env, function _setArn(arn) { config.Attributes.RedrivePolicy.deadLetterTargetArn = arn }, queueName)
    }
    createPrimaryQueue(env, callback, queueName, config)
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
