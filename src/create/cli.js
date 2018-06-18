#!/usr/bin/env node
let waterfall = require('run-waterfall')
let chalk = require('chalk')
let init = require('../util/init')
let create = require('.')
let stop = require('./_print').stop

waterfall([
  function(callback){init(callback)}, create
],
function done(err) {
  if (err && err.linenumber > -1) {
    console.log(chalk.bold.red(`Error: .arc line ${err.linenumber}`), chalk.bold(err.message))
    if (err.raw) {
      prettyPrintArc(err)
    }
    if (err.detail) {
      console.log(err.detail)
      console.log('\n')
    }
    process.exit(1)
  }
  else if (err && err.message === 'Too Many Requests') {
    console.log(chalk.dim('-----'))
    console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
    console.log(chalk.dim('-----'))
    console.log(`Congratulations: you have been throttled! This is a very common error with AWS and nothing to worry about. This means you are working faster than your account is currently provisioned to handle. Try re-running ` + chalk.cyan.bold('npx create') + ' after a few minutes. If the problem persists you can request limit increases by contacting AWS support.')
    process.exit(1)

  }
  else if (err) {
    console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
    console.log(chalk.dim(err.stack))
    process.exit(1)
  }
  else {
    stop()
    process.exit(0)
  }
})

function prettyPrintArc(err) {
  let linenumber = 1
  console.log(chalk.dim('-----'))
  err.raw.split('\n').forEach(row=> {
    let fail = err.linenumber === linenumber
    let l = ''+linenumber
    let ln = fail? chalk.red(`▶${l.padStart(3, ' ')}.`) : chalk.dim(` ${l.padStart(3, ' ')}.`)
    let content = fail? chalk.yellow(row) : row
    console.log(`${ln} ${content}`)
    linenumber += 1
  })
  console.log(chalk.dim('-----'))
}
