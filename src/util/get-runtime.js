
const DEFAULT_RUNTIME = 'nodejs8.10'

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
