let basicEnv = require('./01-env')
let banner = require('./02-banner')

module.exports = function before (params) {
  basicEnv()  // Load essential env vars (NODE_ENV, AWS_REGION, etc.)
  banner(params) // Print banner + initialize AWS credentials
}
