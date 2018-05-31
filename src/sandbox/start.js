let chalk = require('chalk')
let db = require('./db')
let env = require('./env')
let events = require('./events')
let http = require('./http')
let series = require('run-series')
let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')

module.exports = function start(callback) {
  let client
  let server
  let bus
  series([
    // hulk smash
    function _banner(callback) {
      let raw = fs.readFileSync(path.join(process.cwd(), '.arc')).toString()
      let arc = parse(raw)
      let name = arc.app[0]
      // display the @app name as the sandbox banner
      console.log('')
      console.log(chalk.bgCyan.black(` ${name} `), '\n')
      callback()
    },
    function _db(callback) {
      // start dynalite with tables enumerated in .arc
      client = db.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@tables created in local database')
        console.log(`${start}`)
        callback()
      })
    },
    function _env(callback) {
      // populates process.env from .arc-env
      env(callback)
    },
    function _events(callback) {
      // listens for arc.event.publish events on 3334 and runs them in a child process
      bus = events.start(function() {
        let start = chalk.grey(chalk.green.dim('✓'), '@events pub/sub ready on local event bus')
        console.log(`${start}`)
        callback()
      })
    },
    function _http(callback) {
      // vanilla af http server that mounts routes defined by .arc
      server = http.start(function() {
        let start = chalk.grey('\n', chalk.green.dim('✓'), 'Started HTTP "server" @ ')
        let end = chalk.cyan.underline('http://localhost:3333')
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
    // return a function to shut everything down if this is beinng used as a module for testing
    callback(end)
  })
}

