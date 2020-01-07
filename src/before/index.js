let {bootstrap} = require('@architect/create')
let basicEnv = require('./01-env')
let banner = require('./02-banner')

module.exports = function before(cmd) {
  bootstrap() // Maybe create new project files
  basicEnv()  // Load essential env vars (NODE_ENV, AWS_REGION, etc.)
  banner(cmd) // Print banner + initialize AWS credentials
}
