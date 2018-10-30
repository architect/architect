#!/usr/bin/env node
let chalk = require('chalk')
let series = require('run-series')
let init = require('../util/init')
let deployPublic = require('./public')
let deployFunctions = require('./_deploy-functions')
let deployOne = require('./_deploy-one')
let _progress = require('./_progress')

/**
 * scenarios
 * ---
 *
 * deploy everything
 *
 *   npx deploy [staging|production]
 *
 *
 * deploy something specific
 *
 *    npx deploy [staging|production] [static|public|lambda|lambdas|functions|/path/to/thing]
 *
 * aliases
 * --production, -p
 *
 */
init(function _init(err, arc) {
  if (err) throw err//idk..

  // use this later for measuring time
  let start = Date.now()

  // sekret speed tweak
  if (process.env.PARALLEL_DEPLOYS_PER_SECOND) {
    let check = chalk.green.dim('✓')
    let msg = chalk.grey(`Parallel deploys per second: ${process.env.PARALLEL_DEPLOYS_PER_SECOND}\n`)
    console.log(check, msg)
  }

  // grab userland args
  let args = process.argv.slice(2)

  // we have args! time to figure out env
  let isProd =    args.includes('production') ||
                  args.includes('--production') ||
  let env = isProd? 'production' : 'staging'
  process.env.ARC_DEPLOY = env // final override

  // now figure out what we intend to deploy
  let isStatic =  args.includes('static') ||
                  args.includes('--static') ||
                  args.includes('public') ||
                  args.includes('--public') ||
                  args.includes('/public')
  let isPath =    args.some(arg=> arg.startsWith('/') ||
                  arg.startsWith('src'))
  let isLambda =  args.includes('lambda') ||
                  args.includes('--lambda') ||
                  args.includes('lambdas') ||
                  args.includes('--lambdas') ||
                  args.includes('functions') ||
                  args.includes('--functions')

  // create a tasks queue to walk
  let tasks = []

  if (isStatic) {
    // deploy /public to s3
    tasks.push(function(callback) {
      deployPublic({
        env,
        arc,
        start,
      }, callback)
    })
  }
  else if (isPath) {
    // deploying one lambda
    let pathToCode = args.find(arg=> arg.startsWith('/src') || arg.startsWith('src'))
    let name = chalk.green.dim(`Deploying ${pathToCode}`)
    let total = 7 // magic number of steps in src
    let progress = _progress({name, total})
    function tick(msg) {
      if (msg) {
        progress.tick({'token': msg})
      }
      else {
        progress.tick({'token': 'Working...'})
      }
    }
    tasks.push(function(callback) {
      deployOne({
        env,
        arc,
        pathToCode,
        tick,
        start,
      }, callback)
    })
  }
  else if (isLambda) {
    // deploy just the lambdas
    tasks.push(function(callback) {
      deployFunctions({
        env,
        arc,
        start,
      }, callback)
    })
  }
  else {
    // assume wholesale deployment
    // if already got static don't redeploy it..
    tasks.push(function(callback) {
      deployPublic({
        env,
        arc,
        start,
      }, callback)
    })
    // actual deployz
    tasks.push(function(callback) {
      deployFunctions({
        env,
        arc,
        start,
      }, callback)
    })
  }

  series(tasks)
})
