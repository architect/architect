let parallel = require('run-parallel')
let chalk = require('chalk')
let deploy = require('../lambda-one/deploy')
let _chunk = require('../helpers/chunk')
let _flatten = require('../helpers/flatten')
let _queue = require('../helpers/queue')
let _progress = require('../helpers/progress')

module.exports = function _deployer(params) {

  let {env, arc} = params

  return function _deploy(results, callback) {

    let queue = _queue()
    let firstRun = true
    let timeout = 0

    // boilerplate for the progress bar
    let total = results.length * 3 // 2 deploy + post-deploy steps + 1 tick for bar instantiation
    let progress = _progress({name: chalk.green.dim(`Deploying ${results.length} lambdas`), total})
    let tick = progress.tick

    // fill up a queue
    _chunk(results).forEach(chunk=> {
      // by enqueueing batches to deploy
      queue.add(function _deployChunk(callback) {
        // deploy a batch in parallel
        parallel(chunk.map(pathToCode=> {
          return function _deploysOne(callback) {
            deploy({
              env,
              arc,
              pathToCode,
              tick,
            }, callback)
          }
        }), callback)
      }, timeout)
      // execute the first batch immediately
      // and subsequent batches after 1s delay
      if (firstRun) {
        firstRun = false
        timeout = 1000
      }
    })

    // drain the queue
    queue.start(function _end(err, _stats) {
      if (err) {
        callback(err)
      }
      else {
        let stats = _flatten(_stats)
        callback(null, results, stats)
      }
    })
  }
}
