#!/usr/bin/env node
let chalk = require('chalk')
let create = require('@architect/create/cli')
let deploy = require('@architect/deploy/cli')
let env = require('@architect/env')
let hydrate = require('@architect/hydrate/cli')
let logs = require('@architect/logs/cli')
let pkg = require('@architect/package/cli')
let repl = require('@architect/repl')
let sandbox = require('@architect/sandbox/src/cli/arc')

let before = require('./before')
let help = require('./help')
let version = require('./version')

let update = require('update-notifier')
let _pkg = require('../package.json')

let cmds = {
  create,
  deploy,
  env,
  help,
  hydrate,
  logs,
  package: pkg,
  repl,
  sandbox,
  version
}

let red = chalk.bgRed.bold.white
let yel = chalk.yellow
let dim = chalk.grey

let pretty = {
  fail(cmd, err) {
    console.log(red(`${cmd} failed!`), err && err.message? yel(err.message) : '')
    if (err && err.message)
      console.log(dim(err.stack))
  },
  notFound(cmd) {
    console.log(dim(`Sorry, ${chalk.green.bold('arc ' +cmd)} command not found!`))
  }
}

let args = process.argv.slice(2)

async function run () {
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

(async function main () {
  // Run update check first
  let boxenOpts = {padding: 1, margin: 1, align: 'center', borderColor: 'green', borderStyle: 'round', dimBorder: true}
  update({pkg: _pkg, shouldNotifyInNpmScript: true}).notify({boxenOpts})

  if (args.length === 0 || args[0] === 'help') {
    help(args)
  }
  else if (args[0] === 'create') {
    run()
  }
  else {
    before() // Only run preflight ops on existing projects
    run()
  }
})()
