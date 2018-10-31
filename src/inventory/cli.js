#!/usr/bin/env node
let init = require('../util/init')
let inventory = require('.')
let chalk = require('chalk')
let _local = require('./_local')
let _verify = require('./_verify')
let _nuke = require('./_nuke')
let _nukeTables = require('./_nuke-tables')
let waterfall = require('run-waterfall')

waterfall([
  init,
  inventory,
],
function _inventory(err, result) {
  if (err) {
    console.log(chalk.bold.red('Error'), chalk.bold.white(err.message))
    process.exit(1)
  }
  else {
    var reporter = _local // default to local only
    var command = process.argv.slice(0).reverse().shift()
    var isVerify =      command === 'verify' ||
                        command === '--verify' ||
                        command === '-v'
    var isNuke =        command === 'nuke' ||
                        command === '--nuke' ||
                        command === '-n'
    var isNukeTables =  command === '--nuke=tables' ||
                        process.env.ARC_NUKE === 'tables'
    if (isVerify) {
      reporter = _verify
    }
    if (isNuke || isNukeTables) {
      reporter =  isNukeTables
                    ? _nukeTables
                    : _nuke
    }
    reporter(result)
  }
})
