let chalk = require('chalk')
let series = require('run-series')

let deployPublic = require('./public')
let deployFunctions = require('./lambda-all')
let deployOne = require('./lambda-one')
let _progress = require('../util/progress')

module.exports = {
  lambda: deployOne,
  static: deployPublic,
  main
}

function main(arc, raw, args, callback) {

  // create a tasks queue to walk
  let tasks = []
  let env = args.env
  let start = args.start
  let shouldDelete = args.shouldDelete
  let filters = args.filters

  if (args.isStatic) {
    // deploy /public to s3
    tasks.push(function(callback) {
      deployPublic({
        env,
        shouldDelete,
        arc,
      }, callback)
    })
  }
  else if (args.isPath) {
    // deploying one lambda
    let pathToCode = args.all.find(arg=> arg.startsWith('/src') || arg.startsWith('src'))
    let name = chalk.green.dim(`Deploying ${pathToCode}`)
    let total = 7 // magic number of steps in src
    let progress = _progress({name, total})
    let tick = progress.tick
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
  else if (args.isLambda) {
    // deploy just the lambdas
    tasks.push(function(callback) {
      deployFunctions({
        env,
        arc,
        raw,
        start,
        filters,
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
        raw,
        start,
        filters,
      }, callback)
    })
  }

  // run the tasks
  series(tasks, callback)
}
