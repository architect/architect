/**
 * Ensures the following env vars are present:
 *
 * - ARC_ENV (default 'testing')
 * - NODE_ENV (default 'testing'; possibly munged by 3rd party libraries/frameworks)
 * - AWS_REGION (default us-west-2)
 */
module.exports = function ensureEnv () {
  // always ensure ARC_ENV + NODE_ENV + AWS_REGION
  if (!process.env.ARC_ENV) process.env.ARC_ENV = 'testing'
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'testing'
  if (!process.env.AWS_REGION) process.env.AWS_REGION = 'us-west-2'
}
