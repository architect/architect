#!/usr/bin/env node
let waterfall = require('run-waterfall')
let init = require('../util/init')
let flags = require('./helpers/flags')
let {main} = require('.')
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
  if (err) {
    console.log(err)
    process.exit(1)
  }
  // TODO catch toomanyrequest exceptions and retry once
})
