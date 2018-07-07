let waterfall = require('run-waterfall')
let series = require('run-series')
let chalk = require('chalk')
let assert = require('@smallwins/validate/assert')
let deploy = require('./lambda')
let _report = require('./_report')
let _progress = require('./_progress')
let parallel = require('run-parallel')
let glob = require('glob')
let s3 = require('./static')
let steps = 7 // magic number of steps in src
let _chunk = require('./_chunk')
let _flatten = require('./_flatten')

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
      let pattern = 'src/@(html|css|js|text|xml|json|events|scheduled|tables|slack)/*'
      glob(pattern, callback)
    },
    // create a parallel deployment
    function _deploys(result, callback) {

      // reuse this later
      results = result

      // boilerplate for the progress bar
      let total = results.length * steps
      let progress = _progress({name: chalk.green.dim(`Deploying ${results.length} lambdas`), total})
      let tick = ()=> progress.tick() // closure needed

      // break things up and deploy in sets of ten
      series(_chunk(results).map(chunk=> {
        return function _deploysTen(callback) {
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
        }
      }),
      function done(err, chunked) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, _flatten(chunked))
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
