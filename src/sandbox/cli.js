#!/usr/bin/env node
var chalk = require('chalk')
var cleanEnv = require('../util/clean-env')
var start = require('./start')
var canUse = require('./_port-in-use')
var waterfall = require('run-waterfall')

// use default from ./start module in case no port provided via env
const PORT = process.env.PORT || 3333

waterfall(
  [
    canUse(PORT),
    cleanEnv,
    start
  ],
  function done(err) {
    if (err) {
      console.log(chalk.bold.red(`Error`), chalk.white.bold(err.message))
      if (err.code == "EADDRINUSE") {
        console.log(`The address http://localhost:${PORT} is already in use.`)
      }
      process.exit(1)
    }
  }
)
