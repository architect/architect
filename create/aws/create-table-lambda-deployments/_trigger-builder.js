var parallel = require('run-parallel')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var print = require('../../_print')
var create = require('./_create-lambda')

module.exports = function _triggerBuilder(app, name, method, callback) {

  function _create(app, stage, callback) {
    lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
      if (err && err.name === 'ResourceNotFoundException') {
        console.log('create: ' + stage)
        create(app, `${name}-${method}`, stage, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        print.skip('@json', stage)
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

