#!/usr/bin/env node
let chalk = require('chalk')
let init = require('../util/init')
let inventory = require('../inventory')
let waterfall = require('run-waterfall')
let hydrate = require('.')
let command = process.argv.slice(0).reverse()[0]
let isUpdating =  command === 'update' ||
                  command === '--update' ||
                  command === '-u'
let isShared =    command === 'shared' ||
                  command === '--shared' ||
                  command === '-u'

/**
 * two dependency use cases this tool helps with:
 *
 * - initializing an app (that has many lambdas and thus many package.json deps to fulfill)
 * - updating an app (same problem as above but upgrading deps)
 *
 * examples
 *
 * initializing an app
 * ---
 * run `npm i --no-scripts` on all lambdas:
 *
 *   npx hydrate
 *
 * updating an app
 * ---
 * run `npm update --no-scripts` on all lambdas:
 *
 *   npx hydrate update
 *
 */

waterfall([
  init,
  inventory
],
function _inventory(err, arc) {
  if (err) error(err)
  else {
    let pathToCode = arc.localPaths
    if (isUpdating) {
      // Update dependencies
      //  - tldr: npm update --no-scripts for all Functions + src/shared + src/views
      hydrate.update({
        arc,
        pathToCode
      }, err => { if (err) error(err) })
    }
    else if (isShared) {
      // Install shared dependencies
      // - tldr: npm ci --no-scripts for just src/shared + src/views
      hydrate.shared({
        installing: true,
        arc,
        pathToCode
      }, err => { if (err) error(err) })
    }
    else {
      // Install all dependencies
      // - tldr: npm ci --no-scripts for for all Functions + src/shared + src/views
      hydrate.install({
        arc,
        pathToCode
      }, err => { if (err) error(err) })
    }
  }
})

function error(err) {
  // Special error presentation here to deal with potentially many individual errors from dependency hydration
  console.log(chalk.bold.red('Error') + '\n' + chalk.bold.white(err))
  process.exit(1)
}
