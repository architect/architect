let waterfall = require('run-waterfall')
let parallel = require('run-parallel')
let series = require('run-series')
let aws = require('aws-sdk')

module.exports = function write(arc, raw, configs, callback) {

  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})
  let cloudwatch = new aws.CloudWatchEvents({region})
  let sqs = new aws.SQS({region})

  series(configs.map(config=> {

    let {
      // arcFile,
      isScheduled,
      isQueue,
      staging,
      production,
      timeout,
      memory,
      runtime,
      layers,
      state,
      concurrency,
    } = config

    return function apply(callback) {
      parallel({

        /**
         * updates: memory, timeout, runtime and layers properties
         */
        updateLambdas(callback) {
          series([staging, production].map(FunctionName=> {
            return function update(callback) {
              series([
                function updateFunctionConfiguration(callback) {
                  setTimeout(function rateLimit() {
                    lambda.updateFunctionConfiguration({
                      FunctionName,
                      MemorySize: memory,
                      Timeout: timeout,
                      Runtime: runtime,
                      Layers: layers,
                    }, callback)
                  }, 200)
                },
                function updateFunctionConcurrency(callback) {
                  if (concurrency === 'unthrottled') {
                    setTimeout(function rateLimit() {
                      lambda.deleteFunctionConcurrency({
                        FunctionName,
                      }, callback)
                    }, 200)
                  }
                  else {
                    setTimeout(function rateLimit() {
                      lambda.putFunctionConcurrency({
                        FunctionName,
                        ReservedConcurrentExecutions: concurrency,
                      }, callback)
                    }, 200)
                  }
                }
              ], callback)
            }
          }), callback)
        },

        /**
         * updates state=enabled|disabled for scheduled functions
         */
        updateScheduledState(callback) {
          if (isScheduled) {
            series([staging, production].map(FunctionName=> {
              return function update(callback) {
                if (state === 'disabled') {
                  setTimeout(function rateLimit() {
                    cloudwatch.disableRule({
                      Name: FunctionName,
                    }, callback)
                  }, 200)
                }
                else {
                  setTimeout(function rateLimit() {
                    cloudwatch.enableRule({
                      Name: FunctionName,
                    }, callback)
                  }, 200)
                }
              }
            }), callback)
          }
          else {
            callback()
          }
        },

        /**
         * sync lambda timeout to queue visability
         */
        updateQueueVisability(callback) {
          if (isQueue) {
            series([staging, production].map(FunctionName=> {
              return function update(callback) {
                waterfall([
                  function getQueueUrl(callback) {
                    setTimeout(function rateLimit() {
                      sqs.getQueueUrl({
                        QueueName: FunctionName
                      }, callback)
                    }, 200)
                  },
                  function getQueueAttr({QueueUrl}, callback) {
                    setTimeout(function rateLimit() {
                      sqs.setQueueAttributes({
                        QueueUrl,
                        Attributes: {
                          VisibilityTimeout: ''+timeout // cast to string
                        }
                      }, callback)
                    }, 200)
                  }
                ], callback)
              }
            }), callback)
          }
          else {
            callback()
          }
        }
      }, callback)
    }
  }),
  function done(err) {
    if (err) callback(err)
    else callback()
  })
}
