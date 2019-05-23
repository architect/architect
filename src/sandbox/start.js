let chalk = require('chalk')
let db = require('./db')
let env = require('./env')
let events = require('./events')
let http = require('./http')
let series = require('run-series')
let init = require('../util/init')
let initLocal = require('../init')

module.exports = function start(callback) {

  // setup promise if there is no callback
  var promise
  if (!callback) {
    promise = new Promise(function(res, rej) {
      callback = function(err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  let client
  let bus
  series([
    // hulk smash
    function _banner(callback) {
      init(function _init(err, arcFile) {
        if (err) callback(err)
        else initLocal(arcFile, callback)
      })
    },
    function _env(callback) {
      // populates additional environment variables
      env(callback)
    },
    function _db(callback) {
      // start dynalite with tables enumerated in .arc
      client = db.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@tables created in local database')
        console.log(`${start}`)
        callback()
      })
    },
    function _events(callback) {
      // listens for arc.event.publish events on 3334 and runs them in a child process
      bus = events.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@events and @queues ready on local event bus')
        console.log(`${start}`)
        callback()
      })
    },
    function _http(callback) {
      // vanilla af http server that mounts routes defined by .arc
      http.start(function() {
        let start = chalk.grey('\n', 'Started HTTP "server" @ ')
        let end = chalk.cyan.underline(`http://localhost:${process.env.PORT}`)
        console.log(`${start} ${end}`)
        callback()
      })
    }
  ],
  function _done(err) {
    if (err) callback(err)
    else {
      function end() {
        client.close()
        http.close()
        bus.close()
      }
      // pass a function to shut everything down if this is being used as a module
      callback(null, end)
    }
  })

  return promise
}

