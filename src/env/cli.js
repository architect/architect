#!/usr/bin/env node
let chalk = require('chalk')
let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')
let error = e=> console.log(chalk.bold.red('Error'), chalk.bold.white(e.message))

// possible commands
let _all = require('./_all')
let _one = require('./_one')
let _add = require('./_add')
let _remove = require('./_remove')
let _verify = require('./_verify')

try {
  // get the current app name
  let arcPath = path.join(process.cwd(), '.arc')
  let appname = parse(fs.readFileSync(arcPath).toString()).app[0]

  // parse the command
  let copy = process.argv.slice(0)
  copy.shift() // remove node
  copy.shift() // remove arc-env binary

  // all our predicates
  let envs = ['testing', 'staging', 'production']
  let is = {
    all: copy.length === 0,
    one: copy.length === 1 && envs.includes(copy[0]),
    verify: copy.length === 1 && copy[0] === 'verify',
    add: copy.length === 3 && envs.includes(copy[0]),
    remove: copy.length === 3 && copy[0] === 'remove',
  }

  if (is.all) {
    // npm run env ............................. all
    _all(appname, function allPrinter(err, result) {
      if (err) {
        error(err)
      }
      else {
        console.log(result)
      }
    })
  }
  else if (is.one) {
    // npm run env testing ..................... one
    let env = copy[0]
    _one(appname, env, function onePrinter(err, result) {
      if (err) {
        error(err)
      }
      else {
        console.log(result)
      }
    })
  }
  else if (is.verify) {
    // npm run env verify ...................... verify
    _verify(appname, function verifyPrinter(err, result) {
      if (err) {
        error(err)
      }
      else {
        console.log(result)
      }
    })
  }
  else if (is.add) {
    // npm run env testing FOOBAZ somevalue .... put
    _add(appname, copy, function copyPrinter(err, result) {
      if (err) {
        error(err)
      }
      else {
        console.log(result)
      }
    })
  }
  else if (is.remove) {
    // npm run env remove testing FOOBAZ ....... remove
    _remove(appname, copy, function delPrinter(err, result) {
      if (err) {
        error(err)
      }
      else {
        console.log(result)
      }
    })
  }
  else {
    error(Error('invalid command'))
  }

// hello darkness my old friend
}
catch(e) {
  error(e)
}
