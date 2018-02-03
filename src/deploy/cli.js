#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var parse = require('@architect/parser')
var deployOne = require('./_deploy-one')
var deployAll = require('./_deploy-all')
var _progress = require('./_progress')

// common understandings
var start = Date.now()
let pathToArc = path.join(process.cwd(), '.arc')

// bail if .arc isn't there
let arcExists = fs.existsSync(pathToArc)
if (!arcExists) {
  console.log(chalk.red('missing .arc file'))
  process.exit(1)
}

// deploy to staging by default
let env = (process.env.ARC_DEPLOY === 'production')? 'production' : 'staging'
let arc = parse(fs.readFileSync(pathToArc).toString())
let isAll = process.argv.length === 2

if (isAll) {
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
