#!/usr/bin/env node
let waterfall = require('run-waterfall')
let chalk = require('chalk')
let init = require('../util/init')
let create = require('.')
let stop = require('./_print').stop

let errArcInvalid = require('./errors/arc-invalid')
let errTooManyRequests = require('./errors/too-many-requests')
let errUnknown = require('./errors/unknown')

function flags(arc, raw, callback) {
  if (process.env.ARC_DANGERZONE) {
    console.log(chalk.grey(chalk.green.dim('✓'), `dangerzone: engaged\n`))
  }
  let local = process.argv[2] && process.argv[2] === '--local' || process.argv[2] === '-l' || process.argv[2] === 'local'
  if (local) {
    process.env.ARC_LOCAL = true
  }
  callback(null, arc, raw, callback)
}

waterfall([
  init,
  flags,
  create,
],
function done(err) {
  // trap common errors and try to help
  let arcInvalid = err && err.linenumber > -1
  let tooManyRequests = err && err.message === 'Too Many Requests'

  if (arcInvalid) {
    errArcInvalid(err)
  }
  else if (tooManyRequests) {
    errTooManyRequests(err)
  }
  else if (err) {
    errUnknown(err)
  }
  else {
    stop()
    process.exit(0)
  }
})
