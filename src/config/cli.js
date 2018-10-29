#!/usr/bin/env node
let _report = require('./_report')
let _apply = require('./_apply')
let error = msg=> console.log(chalk.bold.red('Error: ') + chalk.bold.white(msg))
let chalk = require('chalk')
let init = require('../util/init')

// figure out if we're reporting or applying
let command = process.argv.slice(0).reverse().shift()
let exec =  command === 'apply' ||
            command === '--apply' ||
            command === '-a'
              ? _apply
              : _report

// giddy up
init(function _init(err, arc) {
  if (err) {
    error(err.message)
  }
  else {
    exec(arc)
  }
})
