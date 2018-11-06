#!/usr/bin/env node
let waterfall = require('run-waterfall')
let init = require('../util/init')
let {main} = require('.')
let flags = require('./_flags')

// use this later for measuring time
let start = Date.now()

/**
 * scenarios
 * ---
 *
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
// TODO: extract process.argv here and feed into flags (along with start)?
waterfall([
  init,
  flags(start), // parse CLI flags into parameters for what to deploy
  main // feed params into task generator + runner
],
function done(err) {
  if (err) throw err//idk..
  // todo: calculate runtime w/ above start?
})
