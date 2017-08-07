#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var chalk = require('chalk')
var parallel = require('run-parallel')
var deploy = require('.')

var pathToArc = path.join(process.cwd(), '.arc')

if (!fs.existsSync(pathToArc)) {
  console.log(chalk.red('missing .arc file'))
  process.exit(1)
}

// deploy to staging by default
var env = (process.env.ARC_DEPLOY === 'production')? 'production' : 'staging'

// deploy everything in ./src by default
var isMany = process.argv.length === 2
if (isMany) {
  var pattern = 'src/@(html|json|events|scheduled|tables|slack)/*'
  glob(pattern, function _glob(err, results) {
    if (err) {
      console.log(chalk.red('failed to glob'), err)
      process.exit(1)
    }
    else {
      parallel(results.map(pathToCode=> {
        return function _deploy(callback) {
          deploy({
            env,
            pathToArc,
            pathToCode,
          }, callback)
        }
      }))
    }
  })
}
else {
  var pathToCode = process.argv[2]
  var noop = x=>!x
  deploy({
    env,
    pathToArc,
    pathToCode,
  }, noop)
}
