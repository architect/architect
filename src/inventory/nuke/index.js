let chalk = require('chalk')
let series = require('run-series')
let s3 = require('./s3')
let lambda = require('./lambdas')
let restapis = require('./restapis')
let websocketapis = require('./websocketapis')
let snstopics = require('./snstopics')
let cwerules = require('./cwerules')
let sqstopics = require('./sqstopics')

module.exports = function nuke(inventory, callback) {

  if (!callback)
    callback = function noop() {}

  console.log('\n'+chalk.grey.bold('Inventory Nuke ☢︎'))
  console.log(chalk.red.bold(inventory.app))

  series([
    s3,
    lambda,
    restapis,
    websocketapis,
    snstopics,
    cwerules,
    sqstopics
  ].map(function bind(m) {
    return m.bind({}, inventory)
  }), callback)
}
