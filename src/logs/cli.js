#!/usr/bin/env node
var chalk = require('chalk')
let path = require('path')
var exists = require('path-exists').sync
let init = require('../util/init')
let {logs} = require('.')
let error = e=> console.log(chalk.bold.red('Error'), chalk.bold.white(e.message))

/**
 * npx logs src/http/get-index ................... gets staging logs
 * npx logs production src/http/get-index ........ gets production logs
 * npx logs nuke src/http/get-index .............. clear staging logs
 * npx logs nuke production src/http/get-index ... clear staging logs
 */
var lambda = process.argv[2]
if (!lambda) {
  console.error('Error: missing path to the lambda')
  process.exit(1)
}

var pkg = path.join(lambda, 'package.json')
if (!exists(pkg)) {
  console.error('Error: ' + pkg + ' does not exist')
  console.error('\n')
  console.error('Create a lambda with lambda-create in an npm script.')
  console.error('\n')
  process.exit(1)
}

var json = require(path.join(process.cwd(), pkg))
if (!json.name) {
  console.error('Error: package.json missing name')
  process.exit(1)
}

// get the logs
init(function _init(err, arc) {
  if (err) error(err)
  else {
    // reset for env
    let appname = arc.app[0]
    let env = 'staging'
    let name = '/aws/lambda/' + json.name.replace(appname, `${appname}-${env}`)
    logs(name, function pretty(err, result) {
      if (err) error(err)
      else {
        result.forEach(event=> {
          // make the timestamp friendly to read
          let left = new Date(event.timestamp).toISOString().replace(/T|Z/g, ' ').trim()
          // parse out the cloudwatch messages
          let right = fmt(event.message)
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
})

function fmt(msg) {
  return msg
    .replace(/(^\n|\n$)/g, '')
    .split('\t')
    .splice(2)
}
