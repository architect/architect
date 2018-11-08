#!/usr/bin/env node
var chalk = require('chalk')
var start = require('./start')
var canUse = require('./_port-in-use')
var waterfall = require('run-waterfall')

waterfall(
  [
    canUse(process.env.PORT || 3333), // use default from ./start module in case no port provided via env
    cleanEnv,
    start
  ],
  function done(err) {
    if (err) {
      console.log(chalk.bold.red(`Error`), chalk.white.bold(err.message))
      if (err.code == 'EADDRINUSE') {
        console.log(`The address http://localhost:${process.env.PORT} is already in use.`)
      }
      process.exit(1)
    }
  }
)

function cleanEnv(callback) {
  // enforce local guardrails (and more convenient)
  // this still allows explicit override:
  // NODE_ENV=staging npx sandbox
  if (!process.env.hasOwnProperty('NODE_ENV')) {
    process.env.NODE_ENV = 'testing'
  }
  callback();
}

