var waterfall = require('run-waterfall')
var chalk = require('chalk')
var assert = require('@smallwins/validate/assert')
var deploy = require('./lambda')
var _report = require('./_report')
var _progress = require('./_progress')
var parallel = require('run-parallel')
var glob = require('glob')
var s3 = require('./static')
var steps = 7 // magic number of steps in src
//var start = Date.now()

module.exports = function deployAll(params) {
  assert(params, {
    env: String,
    arc: Object,
    start: Number,
  })
  var {env, arc, start} = params
  var results // use this below
  waterfall([
    // read all .arc known lambdas in src
    function _globs(callback) {
      var pattern = 'src/@(html|json|events|scheduled|tables|slack)/*'
      glob(pattern, callback)
    },
    // create a parallel deployment
    function _deploys(result, callback) {
      results = result
      var total = results.length * steps
      var progress = _progress({name: chalk.green.dim(`Deploying ${results.length} lambdas`), total})
      var tick = ()=> progress.tick() // closure needed
      parallel(results.map(pathToCode=> {
        return function _deploy(callback) {
          deploy({
            env,
            arc,
            pathToCode,
            tick,
          }, callback)
        }
      }), callback)
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
