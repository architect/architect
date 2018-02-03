var fs = require('fs')
var check = require('./_check-port')
var path = require('path')
var parse = require('@architect/parser')
var dynalite = require('dynalite')
var waterfall = require('run-waterfall')
var dynamo = require('./_get-db-client')

var getAttributeDefinitions = require('./create-table/_get-attribute-definitions')
var getKeySchema = require('./create-table/_get-key-schema')
var clean = require('./create-table/_remove-ttl-and-lambda')
var createTable = require('./create-table')

function init(callback) {
    var arcPath = path.join(process.cwd(), '.arc')
    var arc = parse(fs.readFileSync(arcPath).toString())
    var app = arc.app[0]
    var plans = []

    // always create a fallback sessions table
    plans.push(function _createBackUpSessions(callback) {
      var attr = {_idx: '*String'}
      var keys = Object.keys(clean(attr))
      dynamo.createTable({
         TableName: 'arc-sessions',
         AttributeDefinitions: getAttributeDefinitions(attr),
         KeySchema: getKeySchema(attr, keys),
         ProvisionedThroughput: {
           ReadCapacityUnits: 5,
           WriteCapacityUnits: 5
         }
       },
       function _create() {
         // deliberately swallow the error: if it exists already thats ok (this is all in memory)
         callback()
       })
    })

    if (arc.tables) {
      // kludge; pass ALL indexes into createTable to sort out
      var indexes = arc.indexes || []
      arc.tables.forEach(table=> {
        plans.push(function _createTable(callback) {
          createTable({
            table,
            app,
            indexes,
          }, callback)
        })
      })
    }
    waterfall(plans, function(err) {
      if (err) console.log(err)
      callback()
    })
}

var server
function start(callback) {
  var handle = {close(){server.close()}}
  check(function _check(err, inUse) {
    if (err) throw err
    if (inUse) {
      server = {close(){}}
      init(callback)
    }
    else {
      server = dynalite({
        createTableMs: 0
      }).listen(5000, function _server(err) {
        if (err) {
          // if we err then the db has been started elsewhere..
          // just try to continue
          console.log(err)
        }
        init(callback)
      })
    }
  })
  return handle
}

module.exports = {
  start
}
