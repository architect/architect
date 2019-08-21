#!/usr/bin/env node
let chalk = require('chalk')
let deploy = require('@architect/deploy/cli')
let env = require('@architect/env')
let hydrate = require('@architect/hydrate/cli')
let init = require('@architect/utils/init')
let logs = require('@architect/logs/cli')
let pkg = require('@architect/package/cli')
let repl = require('@architect/repl')
let sandbox = require('@architect/sandbox/src/cli/arc')

let before = require('./before')
let help = require('./help')
let version = require('./version')

let cmds = {
  deploy,
  env,
  help,
  hydrate,
  init,
  logs,
  package: pkg,
  repl,
  sandbox,
  version
}

let args = process.argv.slice(2)
let cmd
let opts

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

try {
  before()
  ;(async function main() {
    if (args.length === 0) {
      help(args)
    }
    else {
      cmd = args.shift()
      opts = args.slice(0)
      if (cmds[cmd]) {
        await cmds[cmd](opts)
      }
      else {
        pretty.notFound(cmd)
        process.exit(1)
      }
    }
  })()
}
catch(err) {
  pretty.fail(cmd, err)
  process.exit(1)
}
