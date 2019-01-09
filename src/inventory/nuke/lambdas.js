let aws = require('aws-sdk')
let series = require('run-series')
let print = require('./_print')

module.exports = function lambdas(inventory, callback) {
  let {header, notfound, error, deleted} = print(inventory)
  header(`Lambda Functions (${inventory.lambdas.length})`)
  let lambda = new aws.Lambda({region:process.env.AWS_REGION})
  series(inventory.lambdas.map(FunctionName=> {
    return function _getLambda(callback) {
      lambda.deleteFunction({FunctionName}, function _prettyPrint(err) {
        if (err && err.code === 'ResourceNotFoundException') {
          notfound(FunctionName)
        }
        else if (err) {
          error(err.message)
          console.log(err)
        }
        else {
          deleted(FunctionName, 'Deleted')
        }
        callback()
      })
    }
  }), callback)
}
