let parse = require('@architect/parser')
let read = require('fs').readFileSync
let exists = require('path-exists').sync
let join = require('path').join
let chalk = require('chalk')

module.exports = function _setupEnv(callback) {

  // force local db for sessions if NODE_ENV is testing
  if (process.env.NODE_ENV === 'testing') {
    process.env.SESSION_TABLE_NAME = 'arc-sessions'
  }

  // interpolate arc-env
  let envPath = join(process.cwd(), '.arc-env')
  if (!exists(envPath)) {
    let help0 = chalk.dim.yellow('? .arc-env not found')
    let help1 = chalk.grey('generate .arc-env by running')
    let help2 = chalk.dim.green('npx env > .arc-env')
    console.log(help0, help1, help2)
  }
  else {
    populateEnv(envPath)
    let local = 'init process.env from .arc-env @testing (ARC_LOCAL override)'
    let not = 'init process.env from .arc-env @' + process.env.NODE_ENV
    let msg = process.env.hasOwnProperty('ARC_LOCAL')? local : not
    console.log(chalk.grey(chalk.green.dim('✓'), msg))
  }
  callback()
}

/**
 * populate process.env with .arc-env
 * if NODE_ENV=staging the process.env is populated by @staging (etc)
 * if ARC_LOCAL is present process.env is populated by @testing (so you can access remote dynamo locally)
 */
function populateEnv(path) {
  let raw = read(path).toString()
  let env = parse(raw)
  let actual = process.env.hasOwnProperty('ARC_LOCAL')? 'testing' : process.env.NODE_ENV
  env[actual].forEach(tuple=> {
    process.env[tuple[0]] = tuple[1]
  })
}

