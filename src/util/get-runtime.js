let chalk = require('chalk')

/**
 * Allowed runtimes
 * 1. yes, we are deliberately opting .arc users out of older runtimes; open to discussing in an issue!
 * 2. we will always support the runtimes below as long as aws does...
 */
let allowed = [
  `nodejs10.x`, // index 0 == default runtime
  `nodejs8.10`,
  `python3.7`,
  `python3.6`,
  `go1.x`,
  `ruby2.5`,
  `dotnetcore2.1`,
  `java8`,
]

let defaultRuntime = allowed[0] // Defaults to Node 8.10

/**
 * Extract runtime from @aws section
 * - finds `runtime` in @aws section
 */
module.exports = function getRuntime(arc) {
  if (!arc || !arc.aws) return defaultRuntime

  let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
  let runtime = awsRuntime && awsRuntime[1]
  if (allowed.includes(runtime)) {
    return runtime
  }
  else {
    return defaultRuntime
  }
}

/**
 * Check runtime validity
 */
module.exports.allowed = function allowedRuntimes(runtime) {
  if (allowed.includes(runtime)) {
    return runtime
  }
  else {
    console.log(chalk.bold.yellow(`Warning:`), chalk.bold.white('Invalid runtime specified, defaulting to Node.js 8.10'))
    return allowed[0]
  }
}
