var parallel = require('run-parallel')
var aws = require('aws-sdk')
var print = require('../../_print')
var create = require('./_create-lambda')

module.exports = function _triggerBuilder(app, name, method, callback) {

  let lambda = new aws.Lambda({region: process.env.AWS_REGION})

  function _create(app, stage, callback) {
    lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
      if (err && err.name === 'ResourceNotFoundException') {
        print.create('@tables', `${name}-${method}`)
        create(app, `${name}-${method}`, stage, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        print.skip('@tables', stage)
        callback()
      }
    })
  }

  var staging = _create.bind({}, app, `${app}-staging-${name}-${method}`)
  var production = _create.bind({}, app, `${app}-production-${name}-${method}`)

  parallel([
    staging,
    production,
  ],
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })
}

