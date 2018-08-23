let aws = require('aws-sdk')
let waterfall = require('run-waterfall')

let print = require('../../../_print')
let iam = require('../../_get-iam-role')

let _read = require('./01-read-code')
let _upload = require('./02-upload-code')
let map = require('./03-create-event-source')

/**
 * creates queue lambdas
 *
 * - app-name-staging-queue-name
 * - app-name-production-queue-name
 */

module.exports = function _create({app, queue, name}, callback) {
  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
  lambda.getFunction({
    FunctionName: name
  },
  function _getFunction(err) {
    if (err && err.name === 'ResourceNotFoundException') {
      print.create('@queues', name)

      let read = _read.bind({}, queue)
      let upload = _upload.bind({}, {app, queue, name})

      waterfall([
        iam,
        read,
        upload,
        map,
      ], callback)
    }
    else if (err) {
      console.log(err)
      callback(err)
    }
    else {
      print.skip('@queues', name)
      callback()
    }
  })
}
