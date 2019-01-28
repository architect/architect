var assert = require('@smallwins/validate/assert')
var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var zip = require('zipit')
var glob = require('glob')
var path = require('path')
var aws = require('aws-sdk')
var getIAM = require('./_get-iam-role')

module.exports = function _getLambda(params, callback) {

  assert(params, {
    section: String,    // events
    codename: String,   // src/events/foo
    deployname: String, // appname-staging-foo
    runtime: String,    // node, python or ruby
  })

  var {section, codename, deployname, runtime} = params

  let runtimes = {
    node: 'node8.10',
    python: 'python3.7',
    ruby: 'ruby2.5'
  }

  var lambda = new aws.Lambda({region:process.env.AWS_REGION})
  var appname = deployname.split(/-(production|staging)-/)[0]

  parallel([
    function _getRole(callback) {
      getIAM(callback)
    },
    function _readCode(callback) {
      waterfall([
        function _read(callback) {
          var pathToCode = path.join('src', section, codename, '*')
          glob(pathToCode, callback)
        },
        function _zip(files, callback) {
          zip({
            input: files,
          }, callback)
        }
      ], callback)
    }
  ],
  function _done(err, results) {
    if (err) {
      callback(err)
    }
    else {

      var role = results.find(r=> r.hasOwnProperty('Arn'))
      var zip = results.find(r=> !r.hasOwnProperty('Arn'))

      lambda.createFunction({
        Code: {
          ZipFile: zip
        },
        Description: `@${section} ${codename}`,
        FunctionName: deployname,
        Handler: 'index.handler',
        MemorySize: 1152,
        Publish: true,
        Role: role.Arn,
        Runtime: runtimes[runtime],
        Timeout: 5,
        Environment: {
          Variables: {
            'NODE_ENV': deployname.includes('staging')? 'staging' : 'production',
            'ARC_APP_NAME': appname,
          }
        }
      },
      function _createFn(err, result) {
        if (err && err.name != 'ResourceConflictException') {
          console.log(err)
          callback(err)
        }
        else if (err && err.name == 'ResourceConflictException') {
          lambda.getFunction({FunctionName:deployname}, function _gotFn(err, data) {
            if (err) {
              callback(err)
            }
            else {
              callback(null, data.Configuration.FunctionArn)
            }
          })
        }
        else {
          callback(null, result.FunctionArn)
        }
      })
    }
  })
}
