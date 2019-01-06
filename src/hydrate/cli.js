#!/usr/bin/env node
let chalk = require('chalk')
let init = require('../util/init')
let inventory = require('../inventory')
let waterfall = require('run-waterfall')
let hydrate = require('.')

// Userland args
let args = process.argv.slice(2)
let isShared =    args.includes('shared') ||
                  args.includes('--shared') ||
                  args.includes('-s')
let isUpdating =  args.includes('update') ||
                  args.includes('--update') ||
                  args.includes('-u')
let installing = !isUpdating

/**
 * Dependency hydrator
 * - Initializes an app for local development
 * - Updates an app's dependencies
 * - Treats shared code (src/shared + src/views) and their dependencies as dependencies
 */

waterfall([
  init,
  inventory
],
function _inventory(err, arc) {
  if (err) error(err)
  else {
    let pathToCode = arc.localPaths
    let start = Date.now()
    if (isShared) {
      // Install shared dependencies
      // - tldr: npm ci --no-scripts for just src/shared + src/views
      hydrate.shared({
        arc,
        installing,
        pathToCode,
        start,
      }, err => { if (err) error(err) })
    }
    else if (isUpdating) {
      // Update dependencies
      //  - tldr: npm update --no-scripts for all Functions + src/shared + src/views
      hydrate.update({
        arc,
        pathToCode,
        start,
      }, err => { if (err) error(err) })
    }
    else {
      // Install all dependencies
      // - tldr: npm ci --no-scripts for for all Functions + src/shared + src/views
      hydrate.install({
        arc,
        pathToCode,
        start,
      }, err => { if (err) error(err) })
    }
  }
})

function error(err) {
  // Special error presentation here to deal with potentially many individual errors from dependency hydration
  console.log(chalk.bold.red('Error') + '\n' + chalk.bold.white(err))
  process.exit(1)
}
