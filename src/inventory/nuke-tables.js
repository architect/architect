let chalk = require('chalk')
let series = require('run-series')
let aws = require('aws-sdk')
let _longest = require('./_get-longest-subject')

module.exports = function _nukeTables(inventory, callback) {

  if (!callback) callback = function noop() {}

  let db = new aws.DynamoDB({region: process.env.AWS_REGION})
  let longest = _longest(inventory)

  function title() {
    console.log(chalk.red.bold(inventory.app))
  }

  function header(msg) {
    console.log('\n'+chalk.grey.bold(msg))
  }

  function deleted(subject, arn) {
    var subj = `${subject} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.red(arn))
  }

  function notfound(msg) {
    var subj = `${msg} `.padEnd(longest, '.') + ' '
    console.log(chalk.dim(subj), chalk.yellow('ARN not found'))
  }

  function error(msg) {
    console.log(chalk.red.bold('Error: '), chalk.white.bold(msg))
  }

  // draw some header output
  header('Inventory Nuke ☢︎')
  title()

  // walk thru the inventory
  header(`DynamoDB Tables`)
  series(inventory.tables.map(TableName=> {
    return function _getLambda(callback) {
      db.deleteTable({TableName}, function _prettyPrint(err, result) {
        if (err && err.code === 'ResourceNotFoundException') {
          notfound(TableName)
        }
        else if (err) {
          error(err.message)
          console.log(err)
        }
        else {
          deleted(TableName, result.TableDescription.TableArn)
        }
        callback()
      })
    }
  }), callback)
}
