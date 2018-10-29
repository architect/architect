#!/usr/bin/env node
var chalk = require('chalk')
let init = require('../util/init')

var deployOne = require('./_deploy-one')
var deployAll = require('./_deploy-all')
var _progress = require('./_progress')

let flags = [
  'static',
  'production',
  '--production',
  '-p',
  'staging',
  '--staging',
  '-s'
]

init(function _init(err, arc) {

  // npx deploy production (or --production, prod or -p)
  let override = flags.includes(process.argv[2])
  if (override) {
    let prod = process.argv[2].replace(/-/g, '').startsWith('p')
    process.env.ARC_DEPLOY = prod? 'production' : 'staging'
  }

  // deploy to staging by default
  let env = (process.env.ARC_DEPLOY === 'production')
    ? 'production'
    : 'staging'
  let start = Date.now()
  let isAll = process.argv.length === 2 || (process.argv.length === 3 && override)

  // surface sekret ENV var for experimenting w fast deploys
  if (process.env.PARALLEL_DEPLOYS_PER_SECOND) {
    let check = chalk.green.dim('✓')
    let per = `Parallel deploys per second: ${process.env.PARALLEL_DEPLOYS_PER_SECOND}\n`
    console.log(chalk.grey(check, per))
  }

  // check to see if we're deploying lambdas or static assets


  if (err) {
    console.log(err)
  }
  else if (isAll) {
    // deploy everything in ./src to lambda and ./public to s3
    deployAll({
      env,
      arc,
      start,
    })
  }
  else {
    // otherwise deploy whatever the last arg was (a src/path/to/lambda or public)
    var pathToCode = override? process.argv[3] : process.argv[2]
    var name = chalk.green.dim(`Deploying ${pathToCode}`)
    var total = 7 // magic number of steps in src
    var progress = _progress({name, total})
    let tick = function _tick(msg) {
      if (msg) {
        progress.tick({'token': msg})
      } else {
        progress.tick({'token': 'Working...'})
      }
    }
    deployOne({
      env,
      arc,
      pathToCode,
      tick,
      start,
    })
  }
})
