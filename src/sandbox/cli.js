#!/usr/bin/env node
var net = require('net')
var chalk = require('chalk')
var start = require('./start')
var noop = x=>!x

inUse(3333, function _available(err, ok) {
  if (err) {
    console.log(chalk.bold.red(`Error`), chalk.white.bold(err.message))
    process.exit(1)
  }
  else if (ok) {
    console.log(chalk.bold.red(`Error`), chalk.white.bold(`.arc sandbox cannot start\n`))
    console.log(`The address http://localhost:3333 is already in use.`)
    console.log('\n')
    process.exit(1)
  }
  else {
    start(noop)
  }
})

function inUse(port, fn) {
  var tester = net.createServer()
  .once('error', function (err) {
    if (err.code != 'EADDRINUSE') return fn(err)
    fn(null, true)
  })
  .once('listening', function() {
    tester.once('close', function() { fn(null, false) })
    .close()
  })
  .listen(port)
}
