#!/usr/bin/env node
var chalk = require('chalk')
var init = require('../util/init')
var cleanEnv = require('../util/clean-env')
var populateEnv = require('../util/populate-env')
var prompt = chalk.green('#!/data> ')
var repl = require('repl')
var sandbox = require('../sandbox')
var series = require('run-series')

series([
  cleanEnv,     // If no NODE_ENV specified, set it to 'testing'
  init,         // Initialize app metadata, creds, etc.
  populateEnv,  // Populate env vars from .arc-env (jic)
],
function _done(err) {
  if (err) {
    console.log(chalk.bold.red(`Error`), chalk.white.bold(err.message))
    process.exit(1)
  }
  else {
    // Must require data when called or it'll miss init and env population
    if (process.env.NODE_ENV === 'testing') {
      var db = sandbox.db.start(function _start() {
        var server = repl.start({prompt})
        // eslint-disable-next-line
        server.context.data = require('@architect/data')
        server.on('exit', db.close)
      })
    }
    else {
      var server = repl.start({prompt})
      // eslint-disable-next-line
      server.context.data = require('@architect/data')
    }
  }
})
