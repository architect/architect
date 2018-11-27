#!/usr/bin/env node
let waterfall = require('run-waterfall')
var chalk = require('chalk')
let strftime = require('strftime')
let path = require('path')
let init = require('../util/init')
let {logs, nuke} = require('.')
let error = e=> console.log(chalk.bold.red('Error'), chalk.bold.white(e.message))

/**
 * npx logs src/http/get-index ................... gets staging logs
 * npx logs production src/http/get-index ........ gets production logs
 * npx logs nuke src/http/get-index .............. clear staging logs
 * npx logs nuke production src/http/get-index ... clear staging logs
 */
let args = process.argv.slice(2)

// check for env (production)
let env = 'staging'
if (args.includes('production') || args.includes('--production') || args.includes('-p')) {
  env = 'production'
}

// check for path (starts with / or src/)
let lambda = args.find(arg => arg.startsWith('/') || arg.startsWith('src'))
if (!lambda) {
  console.error('Error: missing path to the lambda')
  process.exit(1)
}

// FIXME need to use parsed .arc here instead of introspecting package.json
var pkg = path.join(lambda, 'package.json')
var json = require(path.join(process.cwd(), pkg))
if (!json.name) {
  console.error('Error: package.json missing name')
  process.exit(1)
}

// check for nuke
let nuking = args.includes('nuke') || args.includes('--nuke')
let exec = nuking ? _nuke : _logs

waterfall([init, exec])

function _nuke(arc) {
  // fully resolved lambda name (for cloudwatch logs)
  let appname = arc.app[0]
  let name = '/aws/lambda/' + json.name.replace(appname, `${appname}-${env}`)
  nuke(name, function nuked(err) {
    if (err) console.log(err)
    else console.log('nuked logs')
  })
}

function _logs(arc) {
  let appname = arc.app[0]
  let name = '/aws/lambda/' + json.name.replace(appname, `${appname}-${env}`)
  logs(name, function pretty(err, result) {
    if (err) error(err)
    else {
      result.sort((a, b) => (new Date(a.timestamp) - new Date(b.timestamp))) // chronological (most recent at end of output)
      result.forEach(event=> {
        // make the timestamp friendly to read
        //let left = new Date(event.timestamp).toISOString().replace(/T|Z/g, ' ').trim()
        let left = strftime('%b %d, %r', new Date(event.timestamp))
        // parse out the cloudwatch messages
        let right = event.message.replace(/(^\n|\n$)/g, '').split('\t').splice(2)

        // if there are any messages print
        if (right.length != 0) {
          // print the timestamp
          console.log(chalk.cyan(left))
          // filter empties, walk each message
          right.filter(Boolean).forEach(item=> {
            // check for an error
            let isErr = /error/gi.test(item)
            let color = isErr? chalk.bold.red : chalk.grey
            // try to parse json logs
            try {
              let json = JSON.parse(item.trim())
              if (json.errorMessage && json.errorType && json.stackTrace) {
                let str = (' ' + json.errorType + ': ' + json.errorMessage + ' ').padEnd(left.length)
                console.log(chalk.bgRed.white.bold(str))
                console.log(chalk.bgBlack.yellow(json.stackTrace.join('\n')))
              }
              else {
                console.log(color(JSON.stringify(json, null, 2)))
              }
            }
            catch(e) {
              // not json, just print
              console.log(color(item.trim()))
            }
          })
          console.log(' ')
        }
      })
    }
  })
}
