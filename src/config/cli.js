#!/usr/bin/env node
let fs = require('fs')
let parse = require('@architect/parser')
let _report = require('./_report')
let _apply = require('./_apply')
let error = msg=> console.log(chalk.bold.red('Error: ') + chalk.bold.white(msg))
let chalk = require('chalk')

// get the current .arc file
let arc
try {
  arc = parse(fs.readFileSync('.arc').toString())
}
catch(e) {
  error(e.message)
}

// figure out if we're reporting or applying
let command = process.argv.slice(0).reverse().shift()
let exec = command === 'apply'? _apply : _report

// giddy up
exec(arc)
