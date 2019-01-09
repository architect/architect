let chalk = require('chalk')
let series = require('run-series')
let s3 = require('./s3')
let lambda = require('./lambdas')
let restapis = require('./restapis')
let websocketapis = require('./websocketapis')
let snstopics = require('./snstopics')
// TODO add cloudwatch events
// TODO add queues

module.exports = function _cloud(inventory) {

  // draw some header output
  console.log('\n'+chalk.grey.bold('Inventory Nuke ☢︎'))
  console.log(chalk.red.bold(inventory.app))

  // walk the tasks
  function bind(m) { 
    return m.bind({}, inventory)
  }
  let tasks = [s3, lambda, restapis, websocketapis, snstopics].map(bind)
  series(tasks)
}
