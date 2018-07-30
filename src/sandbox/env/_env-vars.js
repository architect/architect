let parse = require('@architect/parser')
let read = require('fs').readFileSync
let exists = require('path-exists').sync
let join = require('path').join
let chalk = require('chalk')

module.exports = function _setupEnv(callback) {

  let arcPath = join(process.cwd(), '.arc')
  let raw = read(arcPath).toString()
  let arc = parse(raw)
  let name = arc.app[0]


  // populate ARC_APP_NAME (used by @architect/functions event.publish)
  process.env.ARC_APP_NAME = name

  // populate SESSION_TABLE_NAME (used by @architect/functions http functions)
  if (process.env.NODE_ENV === 'testing') {
    process.env.SESSION_TABLE_NAME = 'arc-sessions'
  }

  if (process.env.NODE_ENV === 'staging') {
    process.env.SESSION_TABLE_NAME = `${name}-staging-arc-sessions`
  }

  if (process.env.NODE_ENV === 'production') {
    process.env.SESSION_TABLE_NAME = `${name}-production-arc-sessions`
  }

  // populate PORT (used by http server)
  if (!process.env.PORT) {
    process.env.PORT = `3333`
  }

  // interpolate arc-env
  let envPath = join(process.cwd(), '.arc-env')
  if (exists(envPath)) {
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

