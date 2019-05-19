let series = require('run-series')
let deployPublic = require('./public')
let deployFunctions = require('./lambda-all')
let deployOne = require('./lambda-one')

module.exports = {
  lambda: deployOne,
  static: deployPublic,
  main
}

function main(arc, raw, args, callback) {

  // Create a tasks queue to walk
  let tasks = []
  let env = args.env
  let start = args.start
  let deleteOrphans = args.deleteOrphans || false
  let filters = args.filters

  if (args.isStatic) {
    // Deploy /public to S3
    tasks.push(function(callback) {
      deployPublic({
        arc,
        env,
        deleteOrphans,
        start,
      }, callback)
    })
  }
  else if (args.isPath) {
    // Deploy a single Function
    let pathToCode = args.all.find(arg=> arg.startsWith('/src') || arg.startsWith('src'))
    tasks.push(
      function(callback) {
      deployOne({
        arc,
        env,
        pathToCode,
        start,
      }, callback)
    })
  }
  else if (args.isLambda) {
    // Deploy all Functions, but nothing else
    tasks.push(
      function(callback) {
      deployFunctions({
        arc,
        env,
        filters,
        raw,
        start,
      }, callback)
    })
  }
  else {
    // Otherwise just assume a full deployment
    // Deploy /public to S3
    tasks.push(function(callback) {
      deployPublic({
        arc,
        env,
        deleteOrphans,
        start,
      }, callback)
    })
    // Deploy all Functions
    tasks.push(
      function(callback) {
      deployFunctions({
        arc,
        env,
        filters,
        raw,
        start,
      }, callback)
    })
  }

  // run the tasks
  series(tasks, callback)
}
