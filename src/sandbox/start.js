var chalk = require('chalk')
var http = require('./http')
var events = require('./events')
var db = require('./db')
var waterfall = require('run-waterfall')

module.exports = function start(callback) {
  var client
  var server
  var bus
  waterfall([
    function _db(callback) {
      client = db.start(function() {
        var start = chalk.grey.dim('✓ Started Dynalite DynamoDB')
        console.log(`${start}`)
        callback()
      })
    },
    function _events(callback) {
      bus = events.start(function() {
        var start = chalk.grey.dim('✓ Started Event Bus')
        console.log(`${start}`)
        callback()
      })
    },
    function _http(callback) {
      server = http.start(function() {
        var start = chalk.grey.dim('✓ Started HTTP @ ')
        var end = chalk.cyan.underline('http://localhost:3333')
        console.log(`${start} ${end}`)
        callback()
      })
    }
  ],
  function _done(err) {
    if (err) throw err
    function end() {
      client.close()
      server.close()
      bus.close()
    }
    callback(end)
  })
}

