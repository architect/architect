#!/usr/bin/env node
let init = require('../util/init')
let inventory = require('.')
let chalk = require('chalk')
let _local = require('./_local')
let _verify = require('./_verify')
let _tidy = require('./_tidy')
let _nuke = require('./nuke')
let _nukeTables = require('./_nuke-tables')
let waterfall = require('run-waterfall')

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
    var reporter = _local // default to local only
    var command = process.argv.slice(0).reverse().shift()

    var isVerify = command === 'verify' ||
                   command === '--verify' ||
                   command === '-v'

    var isTidy = command === 'tidy' ||
                 command === '--tidy' ||
                 command === '-t'

    var isNuke = command === 'nuke' ||
                 command === '--nuke' ||
                 command === '-n'

    var isNukeTables = command === '--nuke=tables' ||
                       process.env.ARC_NUKE === 'tables'
    // cascade override
    // from least destructive to most
    if (isVerify) {
      reporter = _verify
    }
    else if (isTidy) {
      reporter = _tidy
    }
    else if (isNuke) {
      reporter = _nuke
    }
    else if (isNukeTables) {
      reporter = _nukeTables
    }

    reporter(result)
  }
})
