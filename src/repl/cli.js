#!/usr/bin/env node
var data = require('@architect/data')
var repl = require('repl')
var chalk = require('chalk')
var prompt = chalk.green('#!/data> ')
var sandbox = require('../sandbox')

if (process.env.NODE_ENV === 'testing') {
  var db = sandbox.db.start(function _start() {
    var server = repl.start({prompt})
    server.context.data = data
    server.on('exit', db.close)
  })
}
else {
  var server = repl.start({prompt})
  server.context.data = data
}
