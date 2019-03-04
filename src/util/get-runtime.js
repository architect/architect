
const DEFAULT_RUNTIME = 'nodejs8.10'
const validRuntimes = ['nodejs6.10', DEFAULT_RUNTIME, 'provided']


/**
 * Extract runtime from @aws section
 * - finds `runtime` in @aws section
 */
module.exports = function getRuntime(arc) {
  if (!arc.aws) return DEFAULT_RUNTIME

  let awsRuntime = arc.aws.find(tuple => tuple.includes('runtime'))
  let runtime = awsRuntime && awsRuntime[1] || DEFAULT_RUNTIME
  return runtime
}

/**
 * Export valid runtimes for validator
 */
module.exports.validRuntimes = validRuntimes
