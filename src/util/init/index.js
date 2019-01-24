let readArcFile = require('../read-arc')
let ensureAwsCreds = require('./01-ensure-aws-credentials')
let printBanner = require('./02-print-banner')
/**
 * runs before:
 * - [x] audit
 * - [x] config
 * - [x] create
 * - [x] deploy
 * - [x] dns
 * - [x] env
 * - [x] hydrate
 * - [x] inventory (all commands require region)
 * - [x] repl
 * - [x] sandbox (when NODE_ENV=staging or NODE_ENV=production)
 * - finds .arc, arc.yaml or arc.json
 * - ensures AWS_REGION and AWS_PROFILE exist
 * - also ensures Node >=8.10.x and npm >= 6.x
 * - prints out the execution env in the banner (=
 */
module.exports = function init(callback) {
  let {raw, arc} = readArcFile()
  ensureAwsCreds(arc)
  printBanner(arc)
  callback(null, arc, raw)
}
