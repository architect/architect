let fs = require('fs')
let parse = require('@architect/parser')
let glob = require('glob')
let aws = require('aws-sdk')
let series = require('run-series')
let chalk = require('chalk')
let getFunctionName = require('./_get-function-name')

// helpers
let error = msg=> console.log(chalk.bold.red('Error: ') + chalk.bold.white(msg))
let title = msg=> console.log(chalk.dim.cyan(msg))


module.exports = function report(arc) {

  let lambda = new aws.Lambda
  let appname = arc.app[0]
  let pattern = 'src/@(html|json|events|slack|scheduled|tables)/**/.arc-config'

  glob(pattern, function _glob(err, files) {
    if (err) {
      error(err.message)
    }
    else {
      files.forEach(file=> {
        try {
          let raw = fs.readFileSync(file).toString().trim()
          let config = parse(raw)
          if (config && config.aws) {
            let timeout = config.aws.find(e=> e[0] === 'timeout') || 5
            let memory = config.aws.find(e=> e[0] === 'memory') || 1152
            if (Array.isArray(timeout))
              timeout = timeout[1]
            if (Array.isArray(memory))
              memory = memory[1]
            title(file)
            let staging = getFunctionName(appname, 'staging', file)
            let production = getFunctionName(appname, 'production', file)
            series([staging, production].map(FunctionName=> {
              return function getConfig(callback) {
                lambda.getFunctionConfiguration({
                  FunctionName
                }, callback)
              }
            }),
            function done(err, results) {
              if (err) {
                error(err.message)
              }
              else {
                console.log(chalk.dim('---'))
                results.forEach(fn=> {
                  console.log(' ', chalk.cyan(fn.FunctionName))
                  if (fn.Timeout != timeout) {
                    let left = chalk.dim('timeout ')
                    let right = chalk.red(fn.Timeout + ' seconds') + chalk.yellow( ` expected ${timeout}`)
                    console.log(' ', left, right)
                  }
                  else {
                    console.log(' ', chalk.dim('timeout ') + chalk.green(fn.Timeout + ' seconds'))
                  }
                  if (fn.MemorySize != memory) {
                    let left = chalk.dim('memory ')
                    let right = chalk.red(fn.MemorySize + ' MB') + chalk.yellow(` expected ${memory}`)
                    console.log(' ', left, right)
                  }
                  else {
                    console.log(' ', chalk.dim('memory '), chalk.green(fn.MemorySize + ' MB'))
                  }
                })
                console.log(chalk.dim('---\n'))
              }
            })
          }
          else {
            error('missing @aws')
          }
        }
        catch(e) {
          error(e.message)
        }
      })
    }
  })
}
