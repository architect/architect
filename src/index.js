#!/usr/bin/env node
let chalk = require('chalk')
let _inventory = require('@architect/inventory')
let create = require('@architect/create/src/cli')
let deploy = require('@architect/deploy/src/cli')
let destroy = require('@architect/destroy/src/cli')
let env = require('@architect/env/src/cli')
let hydrate = require('@architect/hydrate/src/cli')
let logs = require('@architect/logs/src/cli')
let sandbox = require('@architect/sandbox/src/cli/arc')

let startup = require('./startup')
let help = require('./help')
let version = require('./version')
let pauser = require('@architect/deploy/src/utils/pause-sandbox')

let update = require('update-notifier')
let _pkg = require('../package.json')

let cmds = {
  create,
  init: create,
  deploy,
  destroy,
  env,
  hydrate,
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
  }
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

  if (cmd && !cmds[cmd]) {
    pretty.notFound(cmd)
    process.exit(1)
  }
  else if (!cmd || cmd === 'help') {
    help(opts)
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
      process.exit(1)
    }
  }
}

module.exports = main

// allow direct invoke
if (require.main === module) {
  (async function () {
    await main()
  })()
}
