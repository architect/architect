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
  let pattern = 'src/@(html|css|js|text|json|xml|events|slack|scheduled|tables)/**/.arc-config'

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
                lambda.updateFunctionConfiguration({
                  FunctionName,
                  MemorySize: memory,
                  Timeout: timeout,
                }, callback)
              }
            }),
            function done(err, results) {
              if (err) {
                error(err.message)
              }
              else {
                results.forEach(r=> {
                  console.log(chalk.green(r.FunctionName))
                })
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

