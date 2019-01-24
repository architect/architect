#!/usr/bin/env node
let _report = require('./_report')
let _apply = require('./_apply')
let init = require('../util/init')
let waterfall = require('run-waterfall')
let chalk = require('chalk')
let error = msg=> console.log(chalk.bold.red('Error: ') + chalk.bold.white(msg))

// figure out if we're reporting or applying
let command = process.argv.slice(0).reverse().shift()
let applyOrReport = command === 'apply' ||
                    command === '--apply' ||
                    command === '-a'
                      ? _apply
                      : _report

// giddy up
waterfall([
  init,
  applyOrReport
],
function done(err) {
  if (err) error(err.message)
})
