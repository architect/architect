var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var aws = require('aws-sdk')
var sns = new aws.SNS

/**
 * creates two sns topics
 *
 * - appname-staging-eventname
 * - appname-production-eventname
 */
module.exports = function _createSnsTopics(params, callback) {

  // ensure no programmers flails
  assert(params, {
    app: String,
    event: String
  })

  // creates an sns topic
  function createTopic(env, callback) {
    sns.createTopic({
      Name: `${params.app}-${env}-${params.event}`,
    },
    function _createTopic(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }

  // create two topics, one for staging one for prod
  var staging = createTopic.bind({}, 'staging')
  var production = createTopic.bind({}, 'production')

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
