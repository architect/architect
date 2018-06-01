#!/usr/bin/env node
/**
 * two dependency use cases this tool helps with:
 *
 * - initializing an app (that has many lambdas and thus many package.json deps to fufill)
 * - updating an app (same problem as above but upgrading deps)
 *
 * examples
 *
 * initializing an app
 * ---
 * run `npm ci --no-scripts` on all lambdas:
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
let hydrate = require('.')
let noop = x=> !x
let isUpdating = process.argv.slice(0).reverse()[0] === 'update'
if (isUpdating) {
  // update everything to latest
  // npm update --no-scripts (for all lambdas in src)
  hydrate.update(noop)
}
else {
  // installing: npm ci --no-scripts (for all lambdas in src)
  hydrate.install(noop)
}
