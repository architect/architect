#!/usr/bin/env node
let chalk = require('@architect/utils/chalk')
let _inventory = require('@architect/inventory')
let create = require('@architect/create/src/cli')
let deploy = require('@architect/deploy/src/cli')
let destroy = require('@architect/destroy/src/cli')
let env = require('@architect/env/src/cli')
let hydrate = require('@architect/hydrate/src/cli')
let logs = require('@architect/logs/src/cli')
let sandbox = require('@architect/sandbox/src/cli/arc')
let pauser = require('@architect/deploy/src/utils/pause-sandbox')

let startup = require('./startup')
let help = require('./help')
let version = require('./version')

let update = require('update-notifier-cjs')
let _pkg = require('../package.json')

let cmds = {
  create,
  init: create,
  deploy,
  destroy,
  env,
  hydrate,
  '-h': help,
  '--help': help,
  help,
  logs,
  sandbox,
  version,
}

let red = chalk.bgRed.bold.white
let yel = chalk.yellow
let dim = chalk.grey

let pretty = {
  fail (cmd, err) {
    console.log(red(`${cmd} failed!`), err && err.message ? yel(err.message) : '')
    if (err && err.message)
      console.log(dim(err.stack))
  },
  notFound (cmd) {
    console.log(dim(`Sorry, ${chalk.green.bold('arc ' + cmd)} command not found!`))
  },
}

async function main (args) {
  // Mainly here for testing
  args = args || process.argv.slice(2)

  // Set quietude
  process.env.ARC_QUIET = process.env.QUIET || args.some(a => a.includes('-quiet')) ? true : ''

  // Check for updates in a non-blocking background process
  let boxenOpts = { padding: 1, margin: 1, align: 'center', borderColor: 'green', borderStyle: 'round', dimBorder: true }
  update({ pkg: _pkg, shouldNotifyInNpmScript: true }).notify({ boxenOpts })

  let cmd = args.shift()
  let opts = args.slice(0)
  let helpFlag = opts.some(f => [ '-h', '--help' ].includes(f))

  if (cmd && !cmds[cmd]) {
    pretty.notFound(cmd)
    return false
  }
  else if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
    help(opts)
  }
  else if (helpFlag) {
    help([ cmd ])
  }
  else {
    try {
      startup.env()
      let inventory = await _inventory({})
      let printBanner = ![ 'create', 'init', 'version' ].includes(cmd)
      if (printBanner) startup.banner({ cmd, inventory })
      await cmds[cmd]({ inventory })
    }
    catch (err) {
      // Unpause the Sandbox watcher
      pauser.unpause()
      pretty.fail(cmd, err)
      return false
    }
  }
  return true
}

module.exports = main

// allow direct invoke
if (require.main === module) {
  (async function () {
    let ok = await main()
    if (!ok) {
      process.exit(1)
    }
  })()
}
