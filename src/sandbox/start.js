var chalk = require('chalk')
var http = require('./http')
var db = require('./db')
var waterfall = require('run-waterfall')

module.exports = function start(callback) {
  var client
  var server
  waterfall([
    function _db(callback) {
      client = db.start(function() {
        var start = chalk.dim('Started Dynalite DynamoDB')
        console.log(`${start}`)
        callback()
      })
    },
    function _http(callback) {
      server = http.start(function() {
        var start = chalk.dim('Started http @')
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
    }
    callback(end)
  })
}

