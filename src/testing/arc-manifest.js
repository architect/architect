/**
 * Arc manifest mock builders
 */

let { DEFAULT_ARC_MANIFEST, DEFAULT_DEPLOY_CONTEXT } = require('./defaults')
let { withDefaults } = require('./helpers')

/**
 * Create a mock Arc manifest
 * @param {Object} options - Override options
 * @returns {Object} Mock arc manifest
 *
 * @example
 * let manifest = createMockArcManifest({ app: 'my-app' })
 * let manifest = createMockArcManifest({
 *   app: 'my-app',
 *   http: ['post /api']
 * })
 */
function createMockArcManifest (options) {
  return withDefaults(options, DEFAULT_ARC_MANIFEST)
}

/**
 * Create a mock deploy configuration
 * @param {Object} options - Override options
 * @returns {Object} Mock deploy config
 *
 * @example
 * let config = createMockDeployConfig({ stage: 'prod' })
 */
function createMockDeployConfig (options) {
  return withDefaults(options, DEFAULT_DEPLOY_CONTEXT)
}

module.exports = {
  createMockArcManifest,
  createMockDeployConfig,
}
