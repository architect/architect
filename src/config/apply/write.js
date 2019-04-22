let parallel = require('run-parallel')
let series = require('run-series')
let aws = require('aws-sdk')

module.exports = function write(arc, raw, configs, callback) {

  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})

  series(configs.map(config=> {

    let {
      // arcFile,
      isScheduled,
      staging,
      production,
      timeout,
      memory,
      runtime,
      layers,
      // state,
      concurrency,
    } = config

    return function apply(callback) {
      parallel({
        updateLambdas(callback) {
          series([staging, production].map(FunctionName=> {
            return function update(callback) {
              series([
                function updateFunctionConfiguration(callback) {
                  lambda.updateFunctionConfiguration({
                    FunctionName,
                    MemorySize: memory,
                    Timeout: timeout,
                    Runtime: runtime,
                    Layers: layers,
                  }, callback)
                },
                function updateFunctionConcurrency(callback) {
                  if (concurrency === 'unthrottled') {
                    lambda.deleteFunctionConcurrency({
                      FunctionName,
                    }, callback)
                  }
                  else {
                    lambda.updateFunctionConcurrency({
                      FunctionName,
                      ReservedConcurrentExecutions: concurrency,
                    }, callback)
                  }
                }
              ], callback)
            }
          }), callback)
        },
        updateScheduledState(callback) {
          //TODO update scheduled state:disabled|enabled
          if (isScheduled) {
            callback()
          }
          else {
            callback()
          }
        },
        updateQueueVisability(callback) {
          //TODO queue visability
          callback()
        }
      }, callback)
    }
  }),
  function done(err) {
    if (err) callback(err)
    else callback(null, arc, raw, configs)
  })
}
