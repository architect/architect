var parallel = require('run-parallel')
var aws = require('aws-sdk')
var lambda = new aws.Lambda

module.exports = function _nukeLambds(lambdas, callback) {
  var fns = lambdas.map(l=> {
    return function _del(callback) {
      setTimeout(function _chill() {
        lambda.deleteFunction({FunctionName: l}, function () {
          // make this work like a promise and swallow errors
          callback()
        })
      }, 2017)
    }
  })
  parallel(fns, callback)
}
