/**
 * Runtime context mock builders
 */

let { DEFAULT_LAMBDA_INVOCATION, DEFAULT_DEPLOY_CONTEXT } = require('./defaults')
let { deepCopy, withDefaults } = require('./helpers')
let { createMockInventory } = require('./inventory')
let { createMockArcManifest } = require('./arc-manifest')

/**
 * Create a mock deploy context
 * @param {Object} options - Override options (inventory, arc, stage, region, etc)
 * @returns {Object} Mock deploy context
 *
 * @example
 * let context = createMockDeployContext()
 * let context = createMockDeployContext({
 *   stage: 'prod',
 *   region: 'eu-west-1'
 * })
 */
function createMockDeployContext (options) {
  let defaults = deepCopy(DEFAULT_DEPLOY_CONTEXT)

  // Add inventory and arc if not provided
  if (!defaults.inventory) {
    defaults.inventory = createMockInventory()
  }
  if (!defaults.arc) {
    defaults.arc = createMockArcManifest()
  }

  if (options) {
    if (options.inventory) defaults.inventory = options.inventory
    if (options.arc) defaults.arc = options.arc
    if (options.stage) defaults.stage = options.stage
    if (options.region) defaults.region = options.region
    if (options.cloudformation) defaults.cloudformation = options.cloudformation
  }

  return defaults
}

/**
 * Create a mock sandbox invocation context
 * @param {Object} options - Override options
 * @returns {Object} Mock sandbox context
 *
 * @example
 * let context = createMockSandboxContext()
 * let context = createMockSandboxContext({
 *   type: 'http',
 *   method: 'POST'
 * })
 */
function createMockSandboxContext (options) {
  let defaults = {
    type: 'http',
    inventory: createMockInventory(),
    arc: createMockArcManifest(),
    env: {},
  }

  if (options) {
    if (options.type) defaults.type = options.type
    if (options.inventory) defaults.inventory = options.inventory
    if (options.arc) defaults.arc = options.arc
    if (options.env) defaults.env = { ...defaults.env, ...options.env }
  }

  return defaults
}

/**
 * Create a mock Lambda invocation event
 * @param {Object} options - Override options
 * @returns {Object} Mock lambda event
 *
 * @example
 * let event = createMockLambdaInvocation()
 * let event = createMockLambdaInvocation({
 *   requestContext: { http: { method: 'POST' } }
 * })
 */
function createMockLambdaInvocation (options) {
  return withDefaults(options, DEFAULT_LAMBDA_INVOCATION)
}

/**
 * Create a mock plugin context
 * @param {Object} options - Override options
 * @returns {Object} Mock plugin context
 *
 * @example
 * let context = createMockPluginContext()
 * let context = createMockPluginContext({ arc: { app: 'custom' } })
 */
function createMockPluginContext (options) {
  let defaults = {
    arc: createMockArcManifest(),
    inventory: createMockInventory(),
    deploySandbox: false,
  }

  if (options) {
    if (options.arc) defaults.arc = options.arc
    if (options.inventory) defaults.inventory = options.inventory
    if (options.deploySandbox !== undefined) defaults.deploySandbox = options.deploySandbox
  }

  return defaults
}

module.exports = {
  createMockDeployContext,
  createMockSandboxContext,
  createMockLambdaInvocation,
  createMockPluginContext,
}
