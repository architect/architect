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

  let lambda = new aws.Lambda({region: process.env.AWS_REGION})
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
            let runtime = config.aws.find(e=> e[0] === 'runtime') || ''
            let layers = config.aws.find(e=> e[0] === 'layers') || []
            if (Array.isArray(timeout))
              timeout = timeout[1]
            if (Array.isArray(memory))
              memory = memory[1]
            if (Array.isArray(runtime))
              runtime = getRuntime(config)
            if (Array.isArray(layers))
              layers = getLayers(config).sort((a,b) => a - b)
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
                let peachy = true
                results.forEach((fn, i) => {
                  if (i > 0) console.log('')
                  console.log(chalk.cyan(fn.FunctionName))
                  // Set up report
                  let start = 10
                  let end = 12
                  let ok = (setting, value) => {
                    return chalk.dim(setting.padStart(start).padEnd(end)) + chalk.green(value)
                  }
                  let notOk = (setting, value, diff) => {
                    peachy = false
                    return chalk.red(setting.padStart(start).padEnd(end)) + chalk.red(value) + '\n' + chalk.yellow('Expected'.padStart(start).padEnd(end)) + chalk.yellow(diff)
                  }

                  // Timeout config
                  if (fn.Timeout != timeout) {
                    console.log(notOk('Timeout', `${fn.Timeout} seconds`, timeout))
                  }
                  else {
                    console.log(ok('Timeout', `${fn.Timeout} seconds`))
                  }

                  // Memory config
                  if (fn.MemorySize != memory) {
                    console.log(notOk('Memory', `${fn.MemorySize} MB`, memory))
                  }
                  else {
                    console.log(ok('Memory', `${fn.MemorySize} MB`))
                  }

                  // Runtime config
                  if (fn.Runtime != runtime) {
                    console.log(notOk('Runtime', fn.Runtime, runtime))
                  }
                  else {
                    console.log(ok('Runtime', fn.Runtime))
                  }

                  // Layer config
                  if (fn.Layers && fn.Layers.length) {
                    fn.Layers = fn.Layers.map(l => l.Arn)
                  }
                  if (fn.Layers.length != layers.length ||
                      !fn.Layers.every(l => layers.includes(l)) ||
                      !layers.every(l => fn.Layers.includes(l))) {
                    function list(l) {
                      let layers = ''
                      l.forEach((l,i) => {
                        if (i === 0) layers += l
                        if (i > 0) layers += `\n${l.padStart(end + l.length)}`
                      })
                      return layers
                    }
                    console.log(notOk('Layers', fn.Layers, list(layers)))
                  }
                  else {
                    console.log(ok('Layers', fn.Layers))
                  }
                })
                console.log(chalk.dim('---\n'))
                // Provide further instruction
                if (!peachy) {
                  console.log(`⚠️  To resolve config diffs, run: ${chalk.bold.white('npx config --apply')}\n`)
                }
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
