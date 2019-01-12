let chalk = require('chalk')
let parallel = require('run-parallel')
let stop = require('../../_print').stop
let ws = require('./list-websocket-apis')
let http = require('./list-rest-apis')
let error = require('./error')
let render = require('./render')

module.exports = function report({arc}, callback) {
  let restApis = arc.hasOwnProperty('http')
  let websocketApis = arc.hasOwnProperty('ws')
  stop()
  if (process.env.ARC_LOCAL) {
    console.log(chalk.cyan.underline('http://localhost:3333'))
    callback()
  }
  else if (restApis || websocketApis) {
    parallel({http, ws}, function done(err, result) {
      if (err) error(err)
      else render(arc, result)
      callback()
    })
  }
  else {
    callback()
  }
}
