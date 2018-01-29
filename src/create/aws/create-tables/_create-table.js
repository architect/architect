var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var dynamo = new aws.DynamoDB
var list = errback=> dynamo.listTables({}, errback)
var getAttributeDefinitions = require('./_get-attribute-definitions')
var getKeySchema = require('./_get-key-schema')
var getTTL = require('./_get-ttl')
var print = require('../../_print')
var clean = require('./_remove-ttl-and-lambda')

module.exports = function _createTable(name, attr, callback) {

  var keys = Object.keys(clean(attr))
  var _ttl = getTTL(attr)

  list(function _tables(err, result) {
    if (err) {
      console.log(err)
      // blow up if a programmer config err
      throw Error('Unable to list Dynamo tables')
    }
    else {
      var found = result.TableNames.find(tbl=> tbl === name)
      if (found) {
        print.skip('@tables', found)
        callback()
      }
      else {
        var TableName = name
        print.create('@tables', name)
        waterfall([
          function _createTable(callback) {
            dynamo.createTable({
              TableName,
              AttributeDefinitions: getAttributeDefinitions(clean(attr)),
              KeySchema: getKeySchema(attr, keys),
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              }
            }, callback)
          },
          function _maybeWaitForCreateComplete(result, callback) {
            if (_ttl) {
              // poll for ready table
              setTimeout(function _wait() {
                dynamo.describeTable({TableName}, function _tbl(err, result) {
                  if (err) {
                    callback(err)
                  }
                  else if (result.Table.TableStatus === 'ACTIVE') {
                    callback()
                  }
                  else {
                    // recurse if not ready
                    _maybeWaitForCreateComplete(result, callback)
                  }
                })
              }, 20000)
            }
            else {
              callback()
            }
          },
          function _maybeAddTTL(callback) {
            if (_ttl) {
              dynamo.updateTimeToLive({
                TableName,
                TimeToLiveSpecification: {
                  AttributeName: _ttl,
                  Enabled: true
                }
              }, callback)
            }
            else {
              callback()
            }
          }
        ],
        function _created(err) {
          if (err) {
            console.log(err)
          }
          callback()
        })
      }
    }
  })
}
