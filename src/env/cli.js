#!/usr/bin/env node
let chalk = require('chalk')
//let parse = require('@architect/parser')
//let fs = require('fs')
//let path = require('path')

let _put = require('./_put')
let _del = require('./_del')
let _one = require('./_one')
let _all = require('./_all')
let error = e=> console.log(chalk.bold.red('Error'), chalk.bold.white(e.message))

// get the current app name
//let arcPath = path.join(process.cwd(), '.arc')
//let appname = parse(fs.readFileSync(arcPath).toString()).app[0]

// parse the command
let copy = process.argv.slice(0)
copy.shift() // remove node
copy.shift() // remove arc-env binary

if (copy.includes('--put')) {
  // put
  _put(copy, function copyPrinter(err, result) {
    if (err) {
      error(err)
    }
    else {
      console.log(result)
    }
  })
}
else if (copy.includes('--delete')) {
  // del
  _del(copy, function delPrinter(err, result) {
    if (err) {
      error(err)
    }
    else {
      console.log(result)
    }
  })
}
else if (copy.length === 1) {
  // read one env
  _one(copy, function onePrinter(err, result) {
    if (err) {
      error(err)
    }
    else {
      console.log(result)
    }
  })
}
else {
  // read all
  _all(copy, function allPrinter(err, result) {
    if (err) {
      error(err)
    }
    else {
      console.log(result)
    }
  })
}
