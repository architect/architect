var lambda = require('./lambda')
var s3 = require('./public')
let series = require('run-series')
let deployPublic = require('./public')
let deployFunctions = require('./_deploy-functions')
let deployOne = require('./_deploy-one')
let _progress = require('./_progress')
let chalk = require('chalk')

module.exports = {
  lambda,
  static: s3,
  main: function main(err, arc, raw, args, callback) {
    if (err) callback(err)
    // create a tasks queue to walk
    let tasks = []
    let env = args.env
    let start = args.start

    if (args.isStatic) {
      // deploy /public to s3
      tasks.push(function(callback) {
        deployPublic({
          env,
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
    else if (args.isLambda) {
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

    series(tasks, callback)
  }
}
