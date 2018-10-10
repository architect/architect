let waterfall = require('run-waterfall')
let chalk = require('chalk')
let assert = require('@smallwins/validate/assert')
let prep = require('./lambda')
let deploy = require('./lambda/deploy')
let _report = require('./_report')
let _progress = require('./_progress')
let parallel = require('run-parallel')
let glob = require('glob')
let s3 = require('./static')
let _chunk = require('./_chunk')
let _flatten = require('./_flatten')
let _queue = require('./_queue')

module.exports = function deployAll(params) {
  assert(params, {
    env: String,
    arc: Object,
    start: Number,
  })
  let {env, arc, start} = params
  let results // use this below
  waterfall([
    // read all .arc known lambdas in src
    function _globs(callback) {
      let pattern = 'src/@(html|http|css|js|text|xml|json|events|scheduled|tables|slack|queues)/*'
      glob(pattern, callback)
    },
    // prep for deployment
    function _prep(result, callback) {
      results = result

      // boilerplate for the progress bar
      let total = results.length * 5 // 4 prep steps + 1 tick for bar instantiation
      let progress = _progress({name: chalk.green.dim(`Prepping ${results.length} lambdas`), total})
      let tick = function _tick(msg) {
        if (msg) {
          progress.tick({'token': msg})
        } else {
          progress.tick({'token': 'Working...'})
        }
      }

      // high-larious waterfall-nested parallel because executions can escape early and call their callback before everything is done
      waterfall([
        function _goPrep(callback) {
          parallel(results.map(pathToCode=> {
            return function _prep(callback) {
              prep({
                env,
                arc,
                pathToCode,
                tick,
              }, callback)
            }
          }), callback)
        }
      ],
      function done(err) {
        if (err) {
          callback(err, results)
        } else {
          callback(null, results)
        }
      })
    },
    // create a parallel deployment
    function _deploy(result, callback) {
      results = result

      let queue = _queue()
      let firstRun = true
      let timeout = 0

      // boilerplate for the progress bar
      let total = results.length * 3 // 2 deploy + post-deploy steps + 1 tick for bar instantiation
      let progress = _progress({name: chalk.green.dim(`Deploying ${results.length} lambdas`), total})
      let tick = function _tick(msg) {
        if (msg) {
          progress.tick({'token': msg})
        } else {
          progress.tick({'token': 'Working...'})
        }
      }

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
      queue.start(function _end(err, results) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, _flatten(results))
        }
      })

    },
    // report the lambda deployment results
    function _reports(stats, callback) {
      _report({
        results,
        env,
        arc,
        start,
        stats
      }, callback)
    },
    // upload .static to s3 based on @static config
    function _statics(callback) {
      s3(params, callback)
    }
  ])
}
