#!/usr/bin/env node
let waterfall = require('run-waterfall')
let init = require('../util/init')
let create = require('.')
let stop = require('./_print').stop

let errArcInvalid = require('./errors/arc-invalid')
let errTooManyRequests = require('./errors/too-many-requests')
let errUnknown = require('./errors/unknown')

waterfall([
  init,
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
