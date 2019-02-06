let waterfall = require('run-waterfall')
let verify = require('./verify')
let read = require('./read')
let write = require('./write')
let iam = require('./iam')

/**
 * creates `ANY /{proxy+}` for one api pointing to get-index
 */
module.exports = function proxy(env, app, callback) {
  waterfall([
    read.bind({}, {app, env}),
    verify,
    write.bind({}, {app, env}),
    iam,
  ],
  function done(err) {
    if (err && err === 'cancel') {
      callback()
    }
    else if (err) {
      callback(err)
    }
    else {
      callback()
    }
  })
}
