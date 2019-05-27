let parse = require('@architect/parser')
let fs = require('fs')
let path = require('path')

module.exports = function readConfigFor(cwd, callback) {
  let arcConfig = path.join(cwd, '.arc-config')
  fs.readFile(arcConfig, function done(err, data) {
    if (err) {
      let runtime = 'nodejs10.x'
      let timeout = getTimeout()
      callback(null, {runtime, timeout})
    }
    else {
      let arc = parse(data.toString())
      let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
      let runtime = awsRuntime? awsRuntime[1] : 'nodejs10.x'
      let timeout = getTimeout(arc)
      callback(null, {runtime, timeout})
    }
  })
}

// 5s is the default timeout that Architect provisions new Lambdas
// Establish parity locally at 5s, but allow for override since devs may be phoning home to dbs via a slow connection
// This global timeout will be overridden by individual .arc-config files in functions
function getTimeout(arc) {
  let timeout = process.env.SANDBOX_TIMEOUT && process.env.SANDBOX_TIMEOUT * 1000
  timeout = timeout || 5 * 1000 // 5 seconds in milliseconds
  let ttl = arc && arc.aws.find(tuple => tuple.includes('timeout'))
  // valid ttl is between 3 and 900 seconds (15 minutes)
  if (ttl && ttl[1] > 3 && ttl[1] < 900) {
    timeout = ttl[1] * 1000 // ttl seconds in milliseconds
  }
  return timeout
}
