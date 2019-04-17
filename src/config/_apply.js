let fs = require('fs')
let parse = require('@architect/parser')
let glob = require('glob')
let aws = require('aws-sdk')
let series = require('run-series')
let chalk = require('chalk')
let getFunctionName = require('./_get-function-name')
let getLayers = require('../util/get-layers')
let getRuntime = require('../util/get-runtime')

// helpers
let error = msg=> console.log(chalk.bold.red('Error: ') + chalk.bold.white(msg))
let title = msg=> console.log(chalk.bold.cyan('Found config:'), chalk.dim.cyan(msg))

module.exports = function report(arc) {

  let lambda = new aws.Lambda({region:process.env.AWS_REGION})
  let appname = arc.app[0]
  let pattern = 'src/@(html|http|css|js|text|json|xml|events|slack|scheduled|tables|queues)/**/.arc-config'

  /*
    TODO At some point in the future we'll refactor this to read .arc instead of glob
    - when we do, take note that Lambda path encoding changed in 4.x when we went from statically bound content type functions to http
    - we added (back) period and dash, and did not reuse chars
    - to maintain backwards compatibility, we'll need to aim legacy functions at a diff path builder
    - see: src/util/get[-legacy]-lambda-name.js
  */
  glob(pattern, function _glob(err, files) {
    if (err) {
      error(err.message)
    }
    else if (!files.length) {
      console.log(chalk.bold.cyan('No .arc-config files found in src/ tree'))
    }
    else {
      files.forEach(file => {
        try {
          // FIXME: add validation logic here
          //   Needs some finagling: create validator looks at a whole .arc manifest, not .arc-config

          // read the .arc-config
          let raw = fs.readFileSync(file).toString().trim()
          let config = parse(raw)
          // if we have it do something about it
          if (config && config.aws) {
            let timeout = config.aws.find(e=> e[0] === 'timeout') || 5
            let memory = config.aws.find(e=> e[0] === 'memory') || 1152
            let runtime = config.aws.find(e=> e[0] === 'runtime') || getRuntime(config) // default runtime
            let layers = config.aws.find(e=> e[0] === 'layer') || []
            if (Array.isArray(timeout))
              timeout = timeout[1]
            if (Array.isArray(memory))
              memory = memory[1]
            if (Array.isArray(runtime))
              runtime = getRuntime(config)
            if (layers.length)
              layers = getLayers(config)
            title(file)
            let staging = getFunctionName(appname, 'staging', file)
            let production = getFunctionName(appname, 'production', file)
            series([staging, production].map(FunctionName=> {
              return function getConfig(callback) {
                lambda.updateFunctionConfiguration({
                  FunctionName,
                  MemorySize: memory,
                  Timeout: timeout,
                  Runtime: runtime,
                  Layers: layers,
                }, callback)
              }
            }),
            function done(err, results) {
              if (err) {
                error(err.message)
              }
              else {
                results.forEach(r=> {
                  console.log(chalk.green('Successfully updated:'), chalk.white(r.FunctionName))
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

