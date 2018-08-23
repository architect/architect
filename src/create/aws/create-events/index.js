let assert = require('@smallwins/validate/assert')
let parallel = require('run-parallel')
let aws = require('aws-sdk')

/**
 * creates two sns topics
 *
 * - appname-staging-eventname
 * - appname-production-eventname
 */
module.exports = function _createSnsTopics(params, callback) {

  let sns = new aws.SNS({region: process.env.AWS_REGION})

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
      setTimeout(callback, 0)
    })
  }

  // create two topics, one for staging one for prod
  let staging = createTopic.bind({}, 'staging')
  let production = createTopic.bind({}, 'production')

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
