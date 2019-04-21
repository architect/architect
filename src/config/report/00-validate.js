let parallel = require('run-parallel')
let aws = require('aws-sdk')
let series = require('run-series')

module.exports = function validate(arc, origraw, configs, callback) {

  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})
  let cloudwatchevents = new aws.CloudWatchEvents({region})

  series(configs.map(config=> {
    let {
      isScheduled,
      staging,
      production,
    } = config
    return function validateOne(callback) {
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
            ...config,
            states,
            concurrencies,
            lambdas,
          })
        }
      })
    }
  }), callback)
}
