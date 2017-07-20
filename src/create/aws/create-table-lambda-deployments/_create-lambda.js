var waterfall = require('run-waterfall')
var zip = require('zipit')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var dynamo = new aws.DynamoDB
var getIAM = require('../_get-iam-role')

//
// name: arc-sessions-insert
// env: appname-staging-arc-sessions-insert
//
module.exports = function _createLambda(app, name, env, callback) {
  var TableName = env.replace(/-insert|-update|-destroy|-delete/g, '')
  var Description = `@table ${env}`
  waterfall([
    // gets the IAM role for lambda execution
    function _getRole(callback) {
      getIAM(callback)
    },
    function _readCode(role, callback) {
      zip({
        input: [
          `src/tables/${name}/index.js`,
          `src/tables/${name}/package.json`,
          `src/tables/${name}/node_modules`
        ],
        cwd: process.cwd()
      },
      function _zip(err, buffer) {
        if (err) {
          callback(err)
          console.log(err)
        }
        else {
          callback(null, buffer, role)
        }
      })
    },
    function _createFunc(zip, role, callback) {
      lambda.createFunction({
        Code: {
          ZipFile: zip
        },
        Description,
        FunctionName: env,
        Handler: "index.handler",
        MemorySize: 1152,
        Publish: true,
        Role: role.Arn,
        Runtime: "nodejs6.10",
        Timeout: 5,
        Environment: {
          Variables: {
            'NODE_ENV': env.includes('staging')? 'staging' : 'production',
            'ARC_APP_NAME': app,
          }
        }
      },
      function _createFn(err, result) {
        if (err && err.name != 'ResourceConflictException') {
          console.log(err)
          callback(err)
        }
        else if (err && err.name == 'ResourceConflictException') {
          lambda.getFunction({FunctionName:env}, function _gotFn(err, data) {
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
    },
    function _checkForEnabledStream(arn, callback) {
      dynamo.describeTable({
        TableName,
      },
      function _table(err, result) {
        if (err) {
          callback(err)
        }
        else {
          var enabled = result.Table.StreamSpecification && result.Table.StreamSpecification.StreamEnabled
          var stream = result.Table.LatestStreamArn
          callback(null, {enabled, stream})
        }
      })
    },
    function _ensureTableActive(tbl, callback) {
      // FIXME do real impl here
      setTimeout(function _wait() {
        callback(null, tbl)
      }, 9999)
    },
    function _enableStreamOnTable(tbl, callback) {
      if (tbl.enabled) {
        callback(null, tbl.stream)
      }
      else {
        dynamo.updateTable({
          TableName,
          StreamSpecification: {
            StreamEnabled: true,
            StreamViewType: 'NEW_AND_OLD_IMAGES'
          }
        },
        function _enabledStream(err, data) {
          if (err && err.name === 'ResourceInUseException') {
            setTimeout(function _waitForResource() {
              _enableStreamOnTable(tbl, callback)
            }, 3333)
          }
          else if (err && err.name === 'ValidationException') {
            // oh cool this means it exists
            dynamo.describeTable({
              TableName,
            },
            function _table(err, result) {
              if (err) {
                callback(err)
              }
              else {
                callback(null, result.Table.LatestStreamArn)
              }
            })
          }
          else if (err) {
            console.log(err)
            callback(err)
          }
          else {
            // ResourceInUseException
            callback(null, data.TableDescription.LatestStreamArn)
          }
        })
      }
    },
    function _addEventSourceToLambda(arn, callback) {
      lambda.createEventSourceMapping({
        EventSourceArn: arn,
        FunctionName: env,
        StartingPosition: 'LATEST'
      },
      function _added(err) {
        if (err) {
          callback(err)
        }
        else {
          callback()
        }
      })
    }],
    function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
