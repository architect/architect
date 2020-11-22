/**
 * Ensures the following env vars are present:
 *
 * - NODE_ENV (default 'testing')
 * - AWS_REGION (default us-west-2)
 */
module.exports = function ensureEnv () {
  // always ensure NODE_ENV + AWS_REGION
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'testing'
  if (!process.env.AWS_REGION) process.env.AWS_REGION = 'us-west-2'
}
