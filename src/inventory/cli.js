#!/usr/bin/env node
let init = require('../util/init')
let chalk = require('chalk')
let waterfall = require('run-waterfall')

let inventory = require('.')
let local = require('./local')
let verify = require('./verify')
let nuke = require('./nuke')
let nukeTables = require('./nuke-tables')
let nukeWithForce = require('./nuke-with-force')

waterfall([
  init,
  inventory,
],
function _inventory(err, result) {
  if (err) {
    console.log(chalk.bold.red('Error'), chalk.bold.white(err.message))
    console.log(chalk.grey(err.stack))
    process.exit(1)
  }
  else {
    let reporter = local // default to local only
    let command = process.argv.slice(0).reverse().shift()

    let isVerify = command === 'verify' ||
                   command === '--verify' ||
                   command === '-v'

    let isNuke = command === 'nuke' ||
                 command === '--nuke' ||
                 command === '-n'

    let argv = process.argv.slice(0)
    let isForceNuke = command === '-nf' ||
                      command === '-fn' ||
                      argv.some(arg=> arg === 'nuke' || arg === '--nuke' || arg === '-n') &&
                      argv.some(arg=> arg === '-f')

    let isNukeTables = command === '--nuke=tables' ||
                       process.env.ARC_NUKE === 'tables'

    if (isVerify) {
      reporter = verify
    }
    else if (isForceNuke) {
      reporter = nukeWithForce
    }
    else if (isNuke) {
      reporter = nuke
    }
    else if (isNukeTables) {
      reporter = nukeTables
    }

    reporter(result)
  }
})
