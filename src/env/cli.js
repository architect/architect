#!/usr/bin/env node
let chalk = require('chalk')
let series = require('run-series')
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

// and a helper
let _printer = require('./_printer')

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
    // npm run env ............................ all
    _all(appname, _printer)
  }
  else if (is.one) {
    // npm run env testing .................... one
    let env = copy[0]
    _one(appname, env, _printer)
  }
  else if (is.verify) {
    // npm run env verify ..................... verify
    _verify(appname, x=> !x)
  }
  else if (is.add) {
    // npm run env testing FOOBAZ somevalue ... put
    series([
      function removes(callback) {
        _add(appname, copy, callback)
      },
      function prints(callback) {
        _all(appname, function(err, result) {
          _printer(err, result)
          callback()
        })
      },
      function verifys(callback) {
        _verify(appname, callback)
      },
    ],
    function _removed(err) {
      if (err) error(err)
    })
  }
  else if (is.remove) {
    // npm run env remove testing FOOBAZ ...... remove
    // remove/print all/verify all
    series([
      function removes(callback) {
        _remove(appname, copy, callback)
      },
      function prints(callback) {
        _all(appname, function(err, result) {
          _printer(err, result)
          callback()
        })
      },
      function verifys(callback) {
        _verify(appname, callback)
      },
    ],
    function _removed(err) {
      if (err) error(err)
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
