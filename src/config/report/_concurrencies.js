let aws = require('aws-sdk')
let series = require('run-series')

module.exports = function concurrencies({staging, production}, callback) {
  let region = process.env.AWS_REGION
  let lambda = new aws.Lambda({region})
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
}
