let waterfall = require('run-waterfall')
let verify = require('./verify')
let read = require('./read')
let write = require('./write')

/**
 * creates `ANY /{proxy+}` for one api pointing to get-index
 */
module.exports = function proxy(env, {app, arc}, callback) {
  waterfall([
    read.bind({}, {app, env, arc}),
    verify,
    write.bind({}, {app, env, arc}),
  ],
  function done(err) {
    if (err && err === 'cancel') {
      console.log('cancelling')
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
