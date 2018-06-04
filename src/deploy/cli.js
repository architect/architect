#!/usr/bin/env node
var chalk = require('chalk')
let init = require('../util/init')

var deployOne = require('./_deploy-one')
var deployAll = require('./_deploy-all')
var _progress = require('./_progress')

init(function _init(err, arc) {

  // deploy to staging by default
  let env = (process.env.ARC_DEPLOY === 'production')? 'production' : 'staging'
  let start = Date.now()
  let isAll = process.argv.length === 2

  if (err) {
    console.log(err)
  }
  else if (isAll) {
    // deploy everything in ./src to lambda and ./.static to s3
    deployAll({
      env,
      arc,
      start,
    })
  }
  else {
    // otherwise deploy whatever the last arg was (a src/path/to/lambda or static)
    var pathToCode = process.argv[2]
    var name = chalk.green.dim(`Deploying ${pathToCode}`)
    var total = 7 // magic number of steps in src
    var progress = _progress({name, total})
    var tick = ()=> progress.tick()
    deployOne({
      env,
      arc,
      pathToCode,
      tick,
      start,
    })
  }
})
