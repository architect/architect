#!/usr/bin/env node
var path = require('path')
var chalk = require('chalk')
var generate = require('.')

generate({
  arcFile: path.join(process.cwd(), '.arc'),
  execute: true
},
function(err) {
  if (err && err.linenumber > -1) {
    console.log(chalk.bold.red(`Error: .arc line ${err.linenumber}`), chalk.bold(err.message))
    if (err.raw) {
      prettyPrintArc(err)
    }
    if (err.detail) {
      console.log(err.detail) 
      console.log('\n')
    }
    process.exit(0)
  } 
  else if (err && err.message === 'Too Many Requests') {
    console.log(chalk.dim('-----'))
    console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
    console.log(chalk.dim('-----'))
    console.log(`Congratulations: you have been throttled! This is a very common error with AWS and nothing to worry about. This means you are working faster than your account is currently provisioned to handle. Try re-running ` + chalk.cyan.bold('npm run create') + ' after a few minutes. If the problem persists you can request limit increases by contacting AWS support.')
  
  }
  else if (err) {
    console.log(chalk.bold.red(`Error`), chalk.bold.white(err.message))
  }
  else {
    console.log('\n')
  }
})

function prettyPrintArc(err) {
  var linenumber = 1
  console.log(chalk.dim('-----'))
  err.raw.split('\n').forEach(row=> {
    var fail = err.linenumber === linenumber
    var l = ''+linenumber
    var ln = fail? chalk.red(`▶${l.padStart(3, ' ')}.`) : chalk.dim(` ${l.padStart(3, ' ')}.`)
    var content = fail? chalk.yellow(row) : row
    console.log(`${ln} ${content}`)
    linenumber += 1
  })
  console.log(chalk.dim('-----'))
}
