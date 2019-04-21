#!/usr/bin/env node
let waterfall = require('run-waterfall')
let chalk = require('chalk')

let init = require('../util/init')
let {report, apply} = require('.')

// figure out if we're reporting or applying
let command = process.argv.slice(0).reverse().shift()
let applyOrReport = command === 'apply' ||
                    command === '--apply' ||
                    command === '-a'
                      ? apply
                      : report
// giddy up
waterfall([
  init,
  applyOrReport
],
function done(err) {
  if (err) {
    let red = chalk.bold.red
    let white = chalk.bold.white
    console.log(red('Error: ') + white(err.message))
  }
})
