/* eslint-disable */
var parallel = require('run-parallel')
var glob = require('glob')
var aws = require('aws-sdk')
//var lambda = new aws.Lambda

module.exports = function _write(config, callback) {
  console.log(JSON.stringify(config,null,2))
  glob('src/@(html|json|events|scheduled|tables)/*', function _glob(err, results) {
    if (err) throw err
    var fns = results.map(result=> {
      console.log(result)
      return function _i(callback) {
        var app = config.arc.app[0]
        // this method writes staging and production lambdas config in parallel
        parallel([
          function _stage(callback) {
            var pkg = ''
            var name = require(pkg).name.replace(app, '')
            var FunctionName = `${app}-staging-${name}`
            callback()
          },
          function _production(callback) {
            var pkg = ''
            var name = require(pkg).name.replace(app, '')
            var FunctionName = `${app}-staging-${name}`
            callback()
          }
        ], callback)
        /*
        lambda.updateFunctionConfiguration({
          FunctionName: "myFunction",
          MemorySize: 128,
          Timeout: 123,
          Environment: {
            Variables: {}
          }
        }, callback)
        */
      }
    })
    parallel(fns, callback)
  })
}
