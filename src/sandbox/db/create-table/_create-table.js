var waterfall = require('run-waterfall')
var dynamo = require('../_get-db-client')
var list = errback=> dynamo.listTables({}, errback)
var getAttributeDefinitions = require('./_get-attribute-definitions')
var getKeySchema = require('./_get-key-schema')
var getTTL = require('./_get-ttl')
var clean = require('./_remove-ttl-and-lambda')
var getGSI = require('./_get-global-secondary-index')
var getAttributeDefinitionsWithGsi = require('./_get-attribute-definitions-with-gsi')
var print = {
  skip(section, msg) {
    console.log(section, msg)
  },
  create(section, msg) {
    console.log(section, msg)
  }
}

module.exports = function _createTable(name, attr, indexes, callback) {

  var keys = Object.keys(clean(attr))
  var _ttl = getTTL(attr)

  list(function _tables(err, result) {
    if (err) {
      // blow up if a programmer config err
      throw Error('Unable to list Dynamo tables')
      console.log(err)
    }
    else {
      var found = result.TableNames.find(tbl=> tbl === name)
      if (found) {
        print.skip('@tables found', found)
        callback()
      }
      else {
        print.create('@tables create', name)
        var params = {
          TableName: name,
          AttributeDefinitions: getAttributeDefinitions(clean(attr)),
          KeySchema: getKeySchema(attr, keys),
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
        var gsi = getGSI(name, indexes)
        if (gsi) {
          params.AttributeDefinitions = getAttributeDefinitionsWithGsi(keys, name, indexes)
          params.GlobalSecondaryIndexes = gsi
        }
        dynamo.createTable(params, function _create(err) {
          if (err) throw err
          callback()
        })
      }
    }
  })
}
