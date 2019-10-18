let {bootstrap} = require('@architect/create')
let ensureCreds = require('./01-ensure-creds')
let maybeBanner = require('./02-maybe-banner')

module.exports = function before() {
  let options = process.argv
  bootstrap({options})  // maybe create .arc
  ensureCreds()         // loads AWS_REGION and AWS_PROFILE
  maybeBanner()         // maybe print cli banner
}
