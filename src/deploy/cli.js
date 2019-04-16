#!/usr/bin/env node
let waterfall = require('run-waterfall')
let init = require('../util/init')
let flags = require('./helpers/flags')
let {main} = require('.')
let errArcInvalid = require('../util/errors/arc-invalid')
let errTooManyRequests = require('../util/errors/too-many-requests')
let errUnknown = require('../util/errors/unknown')
let start = Date.now() // use this later for measuring time

/**
 * deploy everything
 *
 *   npx deploy [staging|production]
 *
 *
 * deploy something specific
 *
 *    npx deploy [staging|production] [static|public|lambda|lambdas|functions|/path/to/thing]
 *
 * aliases
 * --production, -p
 *
 */
waterfall([
  init,         // prints the banner and sets up the env
  flags(start), // parse CLI flags into parameters for what to deploy
  main,         // feed params into task generator + runner
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
})
