let parallel = require('run-parallel')
let aws = require('aws-sdk')
let fs = require('fs')
let parse = require('@architect/parser')
let series = require('run-series')
let getFunctionName = require('../_get-function-name')
let getLayers = require('../../util/get-layers')
let getRuntime = require('../../util/get-runtime')

module.exports = function validate(arc, origraw, configs, callback) {

  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})
  let cloudwatchevents = new aws.CloudWatchEvents({region})

  series(configs.map(arcFile=> {
    return function validateOne(callback) {
      try {
        // relies on filesystem…probably should move to .arc lookup
        let isScheduled = arcFile.includes('scheduled')

        let appname = arc.app[0]
        let raw = fs.readFileSync(arcFile).toString().trim()
        let config = parse(raw)

        // default config
        let staging = getFunctionName(appname, 'staging', arcFile)
        let production = getFunctionName(appname, 'production', arcFile)
        let timeout = 5
        let memory = 1152
        let runtime = getRuntime(config)
        let layers = []
        let state = isScheduled? 'enabled' : 'n/a'
        let concurrency = 'unthrottled'

        if (config && config.aws) {
          timeout = config.aws.find(e=> e[0] === 'timeout') || 5
          memory = config.aws.find(e=> e[0] === 'memory') || 1152
          runtime = config.aws.find(e=> e[0] === 'runtime') || getRuntime(config) // default runtime
          layers = config.aws.find(e=> e[0] === 'layer') || []
          state = config.aws.find(e=> e[0] === 'state') || (isScheduled? 'enabled' : 'n/a')
          concurrency = config.aws.find(e=> e[0] === 'concurrency') || 'unthrottled'
          if (Array.isArray(timeout))
            timeout = timeout[1]
          if (Array.isArray(memory))
            memory = memory[1]
          if (Array.isArray(runtime))
            runtime = getRuntime(config)
          if (layers.length)
            layers = getLayers(config)
          if (Array.isArray(state))
            state = state[1]
          if (Array.isArray(concurrency))
            concurrency = concurrency[1]
        }

        parallel({
          // get the general lambda config
          lambdas(callback) {
            series([staging, production].map(FunctionName=> {
              return function getConfig(callback) {
                lambda.getFunctionConfiguration({
                  FunctionName
                }, callback)
              }
            }), callback)
          },
          // get the lambda concurrency
          concurrencies(callback) {
            series([staging, production].map(FunctionName=> {
              return function getFun(callback) {
                lambda.getFunction({
                  FunctionName
                },
                function done(err, res) {
                  if (err) callback(err)
                  else {
                    let name = FunctionName
                    let concurrency = 'unthrottled'
                    let reserved = res.hasOwnProperty('Concurrency') && res.Concurrency.hasOwnProperty('ReservedConcurrentExecutions')
                    if (reserved)
                      concurrency = ''+res.Concurrency.ReservedConcurrentExecutions
                    callback(null, {concurrency, name})
                  }
                })
              }
            }), callback)
          },
          // if a scheduled lambda read the state (either enabled or disabled)
          states(callback) {
            if (isScheduled) {
              series([staging, production].map(FunctionName=> {
                return function getFun(callback) {
                  cloudwatchevents.describeRule({
                    Name: FunctionName,
                  }, callback)
                }
              }), callback)
            }
            else {
              callback()
            }
          }
        },
        function done(err, {states, concurrencies, lambdas}) {
          if (err) callback(err)
          else {
            // pass state off to pretty print
            callback(null, {
              isScheduled,
              arcFile,
              timeout,
              memory,
              runtime,
              layers,
              state,
              concurrency,
              states,
              concurrencies,
              lambdas,
            })
          }
        })
      }
      catch(e) {
        callback(e)
      }
    }
  }), callback)
}
