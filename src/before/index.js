let {bootstrap} = require('@architect/create')
let ensureCreds = require('./01-env')
let maybeBanner = require('./02-banner')

module.exports = function before() {
  bootstrap()   // Maybe create .arc
  ensureCreds() // Loads essential env vars (NODE_ENV, AWS_REGION, etc.)
  maybeBanner() // Print banner + initialize AWS credentials
}
