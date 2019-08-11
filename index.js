#!/usr/bin/env node
let env = require('@architect/env')
let chalk = require('chalk')
let before = require('./src/before')
let deploy = require('./src/commands/deploy')
let help = require('./src/commands/help')
let hydrate = require('./src/commands/hydrate')
let init = require('./src/commands/init')
let logs = require('./src/commands/logs')
let package = require('./src/commands/package')
let repl = require('@architect/repl')
let sandbox = require('./src/commands/sandbox')
let version = require('./src/commands/version')

let cmds = {
  deploy,
  env,
  help,
  hydrate,
  init,
  logs,
  package,
  repl,
  sandbox,
  version
}

let red = chalk.bgRed.bold.white
let yel = chalk.yellow
let dim = chalk.grey
let pretty = {
  fail(cmd, err) {
    console.log(red(`${cmd} failed!`), yel(err.message))
    console.log(dim(err.stack))
  },
  notFound(cmd) {
    console.log(dim(`Sorry, ${chalk.green.bold('arc ' +cmd)} command not found!`))
  }
}

let args = process.argv.slice(2)

before()

;(async function main() {
  if (args.length === 0) {
    help(args)
  }
  else {
    let cmd = args.shift()
    let opts = args.slice(0)
    if (cmds[cmd]) {
      try {
        await cmds[cmd](opts)
      }
      catch(e) {
        pretty.fail(cmd, e)
        process.exit(1)
      }
    }
    else {
      pretty.notFound(cmd)
      process.exit(1)
    }
  }
})()
