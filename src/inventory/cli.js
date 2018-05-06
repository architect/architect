#!/usr/bin/env node
let path = require('path')
let inventory = require('.')
let arcFile = path.join(process.cwd(), '.arc')
let _local = require('./_local')
let _verify = require('./_verify')
let _nuke = require('./_nuke')
let _nukeTables = require('./_nuke-tables')

inventory(arcFile, function _inventory(err, result) {
  if (err) {
    console.log(chalk.bold.red('Error'), chalk.bold.white(err.message))
    process.exit(1)
  }
  else {
    var reporter = _local // default to local only
    var command = process.argv.slice(0).reverse().shift()
    if (command === 'verify') {
      reporter = _verify 
    }
    if (command === 'nuke') {
      reporter = process.env.ARC_NUKE === 'tables'? _nukeTables : _nuke
    }
    reporter(result)
  }
})
